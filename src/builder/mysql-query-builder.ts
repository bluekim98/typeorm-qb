import {
    Operation,
    OperationNode,
    OperationNodeList,
    QueryBuilder,
} from './query-builder';
import * as R from 'ramda';

export class MysqlQueryBuilder implements QueryBuilder {
    constructor(private readonly key: string) {}

    createQuery(operationNodeList: OperationNodeList): OperationNodeList {
        const queryList: string[] = [];
        let queryNodeList = R.clone(operationNodeList);

        if (queryNodeList.child) {
            const childNodeList = this.createQuery(queryNodeList.child);
            queryNodeList = {
                ...queryNodeList,
                child: childNodeList,
            };
            queryList.push(childNodeList.query);
        }

        const alias = queryNodeList.alias ?? queryNodeList.table;
        const operations = queryNodeList.operations.map((operation) =>
            this.createQueryByOperationNode(operation, alias),
        );

        const query = operations
            .map((operation) => operation.query)
            .join(' AND ');

        queryList.push(query);

        const list = [];
        while (queryList.length) {
            list.push(queryList.pop());
        }

        const nodeList: OperationNodeList = {
            ...queryNodeList,
            operations,
            query: list.join(' AND '),
        };

        return nodeList;
    }

    createQueryByOperationNode(
        operationNode: OperationNode,
        alias: string,
    ): OperationNode {
        const node = R.clone(operationNode);

        const variablesName = `${alias}_${node.column}_${node.index}_${this.key}`;

        let query: string;
        switch (node.operation) {
            case Operation.IN:
            case Operation.NOT_IN:
                query = `${alias}.${node.column} ${node.operation} (:${variablesName})`;
                break;

            default:
                query = `${alias}.${node.column} ${node.operation} :${variablesName}`;
                break;
        }

        return {
            ...node,
            variablesName,
            query: `(${query})`,
        };
    }

    createVariables: (
        operationNodeList: OperationNodeList,
    ) => OperationNodeList;
}
