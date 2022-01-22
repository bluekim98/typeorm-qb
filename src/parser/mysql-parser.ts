import {
    Operation,
    OperationNode,
    OperationNodeList,
} from '@src/builder/query-builder';
import * as R from 'ramda';
import { EntityInfo, Parser, WhereDto } from './parser';

export class MysqlParser implements Parser {
    private index = 0;
    constructor(private readonly entity: EntityInfo) {}

    createOperationNodeList(
        whereDto: WhereDto,
        entityInfo?: EntityInfo,
    ): OperationNodeList {
        const keys = Object.keys(whereDto);
        const nodeList: OperationNode[] = [];
        let child: OperationNodeList;

        for (const key of keys) {
            const [column, operation = 'EQUAL'] = key.split('__');
            const value = whereDto[key];
            if (R.type(value) === 'Object') {
                child = this.createOperationNodeList(value, {
                    table: key,
                    alias: key,
                });
            }

            const node: OperationNode = {
                column,
                operation: Operation[operation.toUpperCase()],
                value,
                index: this.index++,
            };
            nodeList.push(node);
        }

        const table = entityInfo?.table ?? this.entity.table;
        const alias = entityInfo?.alias ?? this.entity.alias;

        const result: OperationNodeList = {
            table,
            alias,
            operations: nodeList,
            child,
        };

        return result;
    }
}
