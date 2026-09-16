#!/bin/sh

set -eu

ROOT_PASS=${ROOT_PASS:?Set ROOT_PASS in the environment}
REPL_USER=${REPL_USER:?Set REPL_USER in the environment}
REPL_PASS=${REPL_PASS:?Set REPL_PASS in the environment}
MYSQL_HOST=${MYSQL_HOST:-127.0.0.1}
MASTER_PORT=${MASTER_PORT:-3306}
SLAVE1_PORT=${SLAVE1_PORT:-3307}
SLAVE2_PORT=${SLAVE2_PORT:-3308}
SOURCE_HOST=${SOURCE_HOST:-mysql-master}

# Promenjeno ime baze za novi SaaS
DB_NAME="excursion_db"

M="mysql -h${MYSQL_HOST} -P${MASTER_PORT} -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S1="mysql -h${MYSQL_HOST} -P${SLAVE1_PORT} -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"
S2="mysql -h${MYSQL_HOST} -P${SLAVE2_PORT} -uroot -p${ROOT_PASS} --protocol=TCP --connect-timeout=5"

SCHEMA_FILE="/tmp/project_schema.sql"

echo "========================================================"
echo "  ExcursionSaaS -- MySQL Replication Setup"
echo "========================================================"

# 1. Provera dostupnosti nodova
wait_mysql() {
  HOST=$1; PORT=$2; NAME=$3
  printf "  Waiting for %s" "$NAME"
  i=0
  while [ $i -lt 30 ]; do
    mysql -h"$HOST" -P"$PORT" -uroot -p"$ROOT_PASS" --protocol=TCP \
      --connect-timeout=3 -e "SELECT 1" > /dev/null 2>&1 \
      && echo " OK" && return 0
    printf "."; sleep 3; i=$((i+1))
  done
  echo " TIMEOUT"; exit 1
}

echo "[ 1/5 ] Checking node availability..."
wait_mysql "$MYSQL_HOST" "$MASTER_PORT" "Master"
wait_mysql "$MYSQL_HOST" "$SLAVE1_PORT" "Slave1"
wait_mysql "$MYSQL_HOST" "$SLAVE2_PORT" "Slave2"
sleep 2

# 2. Kreiranje prazne baze na Masteru (EF Core pravi tabele kasnije!)
echo "[ 2/5 ] Creating empty database on Master..."
$M -e "CREATE USER IF NOT EXISTS '${REPL_USER}'@'%' IDENTIFIED BY '${REPL_PASS}'; ALTER USER '${REPL_USER}'@'%' IDENTIFIED BY '${REPL_PASS}'; GRANT REPLICATION SLAVE ON *.* TO '${REPL_USER}'@'%'; FLUSH PRIVILEGES;"
$M -e "DROP DATABASE IF EXISTS ${DB_NAME};"
$M -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Čitanje Binlog pozicije
echo "[ 3/5 ] Reading binlog position..."
STATUS=$($M --skip-column-names -e "SHOW MASTER STATUS;" 2>/dev/null)
BINLOG_FILE=$(echo "$STATUS" | awk '{print $1}')
BINLOG_POS=$(echo  "$STATUS" | awk '{print $2}')

if [ -z "$BINLOG_FILE" ] || [ -z "$BINLOG_POS" ]; then
  echo "ERROR: Master binary logging is not available. Check docker/master/my.cnf."
  exit 1
fi

mysqldump -h"$MYSQL_HOST" -P"$MASTER_PORT" -uroot -p"${ROOT_PASS}" --protocol=TCP \
  --no-data --single-transaction --skip-lock-tables --no-tablespaces \
  ${DB_NAME} > "$SCHEMA_FILE" 2>/dev/null

# 4. Inicijalizacija replikacije na Slave1 i Slave2
echo "[ 4/5 ] Configuring Slave1 & Slave2 replication..."
$S1 -e "SET GLOBAL super_read_only = OFF; DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S1 ${DB_NAME} < "$SCHEMA_FILE"
printf "STOP REPLICA;\nRESET REPLICA ALL;\nCHANGE REPLICATION SOURCE TO SOURCE_HOST='%s', SOURCE_PORT=3306, SOURCE_USER='%s', SOURCE_PASSWORD='%s', SOURCE_LOG_FILE='%s', SOURCE_LOG_POS=%s, GET_SOURCE_PUBLIC_KEY=1;\nSTART REPLICA;\n" \
  "$SOURCE_HOST" \
  "$REPL_USER" "$REPL_PASS" "$BINLOG_FILE" "$BINLOG_POS" | $S1
$S1 -e "SET GLOBAL super_read_only = ON;"

$S2 -e "SET GLOBAL super_read_only = OFF; DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$S2 ${DB_NAME} < "$SCHEMA_FILE"
printf "STOP REPLICA;\nRESET REPLICA ALL;\nCHANGE REPLICATION SOURCE TO SOURCE_HOST='%s', SOURCE_PORT=3306, SOURCE_USER='%s', SOURCE_PASSWORD='%s', SOURCE_LOG_FILE='%s', SOURCE_LOG_POS=%s, GET_SOURCE_PUBLIC_KEY=1;\nSTART REPLICA;\n" \
  "$SOURCE_HOST" \
  "$REPL_USER" "$REPL_PASS" "$BINLOG_FILE" "$BINLOG_POS" | $S2
$S2 -e "SET GLOBAL super_read_only = ON;"

sleep 3

# 5. Verifikacija
echo "[ 5/5 ] Verifying replication status..."
check_slave() {
  HOST=$1; PORT=$2; NAME=$3
  STATUS=$(mysql -h"$HOST" -P"$PORT" -uroot -p"$ROOT_PASS" --protocol=TCP -e "SHOW REPLICA STATUS\\G" 2>/dev/null)
  IO=$(echo  "$STATUS" | grep "Replica_IO_Running:"  | awk '{print $2}')
  SQL=$(echo "$STATUS" | grep "Replica_SQL_Running:" | awk '{print $2}')
  
  ERRORS=$(echo "$STATUS" | grep "Last_SQL_Errno:" | awk '{print $2}')

  if [ "$IO" = "Yes" ] && [ "$SQL" = "Yes" ] && [ "$ERRORS" = "0" ]; then
    echo "  $NAME: >>> REPLICATION ACTIVE <<<" 
  else
    echo "  $NAME: >>> CHECK FAILED (IO=$IO SQL=$SQL SQL_ERRNO=$ERRORS) <<<"
    return 1
  fi
}

check_slave "$MYSQL_HOST" "$SLAVE1_PORT" "Slave1"
check_slave "$MYSQL_HOST" "$SLAVE2_PORT" "Slave2"

rm -f "$SCHEMA_FILE"