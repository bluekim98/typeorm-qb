import {
    Operation,
    OperationNode,
    OperationNodeList,
    QueryBuilder,
} from './query-builder';
import * as R from 'ramda';

export class MysqlQueryBuilder implements QueryBuilder {
    constructor(private readonly transactionKey: string) {}

    build(operationNodeList: OperationNodeList): OperationNodeList {
        const nodeList = this.createQuery(operationNodeList);
        return this.createVariables(nodeList);
    }

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
        const operations = queryNodeList.operations
            .filter((operation) => R.type(operation.value) !== 'Object')
            .map((operation) => {
                return this.createQueryByOperationNode(operation, alias);
            });

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

        const variablesName = `${alias}_${node.column}_${node.index}_${this.transactionKey}`;

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

    createVariables(operationNodeList: OperationNodeList): OperationNodeList {
        const nodeList = R.clone(operationNodeList);

        let variables: Record<string, unknown>;
        for (const operation of nodeList.operations) {
            variables = {
                ...variables,
                [operation.variablesName]: operation.value,
            };
        }

        if (nodeList.child) {
            const child = this.createVariables(nodeList.child);
            variables = {
                ...variables,
                ...child.variables,
            };
        }

        return {
            ...nodeList,
            variables,
        };
    }
}
