import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import Keyword, DDL, DML

class UnsafeSQLError(Exception):
    pass

BLOCKED_KEYWORDS = {
    "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
    "TRUNCATE", "REPLACE", "MERGE", "GRANT", "REVOKE",
    "EXECUTE", "EXEC", "CALL", "SET", "BEGIN", "COMMIT", "ROLLBACK",
}

def validate_sql(sql: str) -> str:
    sql = sql.strip().rstrip(";")
    parsed = sqlparse.parse(sql)
    if not parsed:
        raise UnsafeSQLError("Could not parse SQL")

    for statement in parsed:
        for token in statement.flatten():
            val = token.value.upper()
            if token.ttype in (DDL, DML) and val in BLOCKED_KEYWORDS:
                raise UnsafeSQLError(f"Blocked: {val}")
            if token.ttype is Keyword and val in BLOCKED_KEYWORDS:
                raise UnsafeSQLError(f"Blocked: {val}")

    first_token = _first_meaningful_token(parsed[0])
    if first_token.upper() != "SELECT":
        raise UnsafeSQLError(f"Only SELECT allowed. Got: {first_token}")
    
    return sql

def _first_meaningful_token(statement: Statement) -> str:
    for token in statement.flatten():
        if not token.is_whitespace:
            return token.value
    return ""