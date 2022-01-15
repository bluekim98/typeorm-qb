import { Operation, OperationNode, QueryBuilder } from './query-builder';
import * as R from 'ramda';

export class MysqlQueryBuilder implements QueryBuilder {
    constructor(private readonly key: string | number) {}

    createQuery(operationNode: OperationNode): OperationNode {
        const node = R.clone(operationNode);
        const queryList: string[] = [];

        let child: OperationNode;
        if (node.child) {
            child = this.createQuery(node.child);
            queryList.push(child.query);
        }

        const alias = node.alias ?? node.table;
        const variablesName = `${this.key}_${alias}_${node.index}`;

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
        queryList.push(`(${query})`);
        const list = this.sortDesc(queryList);
        const result = list.join(' AND ');
        return {
            ...node,
            query: `(${result})`,
            variablesName,
            child,
        };
    }

    createVariables(operationNode: OperationNode): OperationNode {
        const node = R.clone(operationNode);
        let variables: Record<string, unknown> = {};

        let child: OperationNode;
        if (node.child) {
            child = this.createVariables(node.child);
            variables = {
                ...variables,
                ...child.variables,
            };
        }

        let value: any;
        switch (node.operation) {
            case Operation.LIKE:
            case Operation.NOT_LIKE:
                value = `%${node.value}%`;
                break;
            case Operation.LIKE_START:
            case Operation.NOT_LIKE_START:
                value = `${node.value}%`;
                break;
            case Operation.LIKE_END:
            case Operation.NOT_LIKE_END:
                value = `%${node.value}`;
                break;
            default:
                value = node.value;
                break;
        }

        variables[node.variablesName] = value;

        return {
            ...node,
            child,
            variables,
        };
    }

    private sortDesc(list: readonly string[]) {
        const copyList = [...R.clone(list)];
        const result: string[] = [];
        while (copyList.length) {
            result.push(copyList.pop());
        }
        return result;
    }
}
