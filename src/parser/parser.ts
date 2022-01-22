import { OperationNodeList } from '@src/builder/query-builder';

export type WhereDto = Record<string, any>;
export interface EntityInfo {
    table: string;
    alias?: string;
}

export interface Parser {
    createOperationNodeList: (
        whereDto: WhereDto,
        entityInfo?: EntityInfo,
    ) => OperationNodeList;
}
