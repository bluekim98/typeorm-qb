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
    readonly table: string;
    readonly alias?: string;
    readonly column: string;
    readonly operation: Operation;
    readonly value: unknown;
    readonly child?: OperationNode;
    readonly variablesName?: string;
    readonly query?: string;
    readonly variables?: Record<string, unknown>;
    readonly index: number;
}

export interface QueryBuilder {
    createQuery: (operationNode: OperationNode) => OperationNode;
    createVariables: (operationNode: OperationNode) => OperationNode;
}
