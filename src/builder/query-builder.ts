export enum Operation {
    EQUAL = '=',
    NOT = '!=',
    IN = 'IN',
    NOT_IN = 'NOT IN',
    LT = '<',
    LTE = '=<',
    GT = '>',
    GTE = '>=',
    LIKE = 'LIKE',
    NOT_LIKE = 'NOT LIKE',
    LIKE_START = 'LIKE',
    NOT_LIKE_START = 'NOT LIKE',
    LIKE_END = 'LIKE',
    NOT_LIKE_END = 'NOT LIKE',
}

export interface OperationNode {
    readonly column: string;
    readonly operation: Operation;
    readonly value: unknown;
    readonly variablesName?: string;
    readonly query?: string;
    readonly index: number;
}

export interface OperationNodeList {
    readonly table: string;
    readonly alias?: string;
    readonly operations: OperationNode[];
    readonly child?: OperationNodeList;
    readonly query?: string;
    readonly variables?: Record<string, unknown>;
}

export interface QueryBuilder {
    createQuery: (operationNodeList: OperationNodeList) => OperationNodeList;
    createVariables: (
        operationNodeList: OperationNodeList,
    ) => OperationNodeList;
}
