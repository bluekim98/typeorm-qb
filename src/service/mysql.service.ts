import { MysqlQueryBuilder } from '@src/builder/mysql-query-builder';
import { OperationNodeList } from '@src/builder/query-builder';
import { MysqlParser } from '@src/parser/mysql-parser';
import { EntityInfo, WhereDto } from '@src/parser/parser';

/**
 * your typeorm repository by target Entity type
 */
type Repository<E> = any;

export abstract class MysqlService<E> {
    constructor(private readonly repository?: Repository<E>) {}

    protected abstract getEntityInfo(): EntityInfo;

    makeWhere(where: WhereDto): OperationNodeList {
        const entityInfo = this.getEntityInfo();
        const parser = new MysqlParser(entityInfo);
        const operationNodeList = parser.createOperationNodeList(where);
        const transactionKey = new Date().getTime().toString();
        const mysqlQueryBuilder = new MysqlQueryBuilder(transactionKey);
        const result = mysqlQueryBuilder.build(operationNodeList);
        return result;
    }
}
