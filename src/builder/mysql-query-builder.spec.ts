import { MysqlQueryBuilder } from './mysql-query-builder';
import { Operation, OperationNode } from './query-builder';
import * as R from 'ramda';

describe('MysqlQueryBuilder', () => {
    const key = 'test';
    const mysqlQueryBuilder = new MysqlQueryBuilder(key);

    it('is defined', () => {
        expect(mysqlQueryBuilder).toBeDefined();
    });

    describe('createQuery', () => {
        const equalNode: OperationNode = {
            table: 'user',
            alias: 'user',
            column: 'id',
            operation: Operation.EQUAL,
            value: 1,
            index: 0,
        };

        it('equal node', () => {
            const node: OperationNode = { ...equalNode };

            const query = `((user.id = :${key}_user_0))`;
            const result = mysqlQueryBuilder.createQuery(node);

            expect(result.query).toBe(query);
        });

        it('in node', () => {
            const node: OperationNode = {
                ...equalNode,
                operation: Operation.IN,
            };

            const query = `((user.id IN (:test_user_0)))`;
            const result = mysqlQueryBuilder.createQuery(node);

            expect(result.query).toBe(query);
        });

        it('not in node', () => {
            const node: OperationNode = {
                ...equalNode,
                operation: Operation.NOT_IN,
            };

            const query = `((user.id NOT IN (:test_user_0)))`;
            const result = mysqlQueryBuilder.createQuery(node);

            expect(result.query).toBe(query);
        });

        it('like node', () => {
            const node: OperationNode = {
                ...equalNode,
                operation: Operation.LIKE,
            };

            const query = `((user.id LIKE :test_user_0))`;
            const result = mysqlQueryBuilder.createQuery(node);

            expect(result.query).toBe(query);
        });
    });

    describe('createVariables', () => {
        let equalNode: OperationNode;

        beforeAll(() => {
            const node: OperationNode = {
                table: 'user',
                alias: 'user',
                column: 'id',
                operation: Operation.EQUAL,
                value: 1,
                index: 0,
            };
            equalNode = mysqlQueryBuilder.createQuery(node);
        });

        it('equal node test', () => {
            const node = mysqlQueryBuilder.createVariables(equalNode);
            expect(node.variables['test_user_0']).toBeDefined();
            expect(node.variables['test_user_0']).toBe(1);
        });

        it('like node test', () => {
            const likeNode: OperationNode = {
                ...equalNode,
                value: 'test',
                operation: Operation.LIKE,
            };
            const node = mysqlQueryBuilder.createVariables(likeNode);
            expect(node.variables['test_user_0']).toBeDefined();
            expect(node.variables['test_user_0']).toBe('%test%');
        });
    });

    describe('query depth test', () => {
        let rootNode: OperationNode;

        beforeAll(() => {
            const childNode: OperationNode = {
                table: 'user',
                alias: 'user',
                column: 'id',
                operation: Operation.EQUAL,
                value: 1,
                index: 1,
            };
            rootNode = {
                ...childNode,
                index: 0,
                child: childNode,
            };
        });

        it('createQuery test', () => {
            const node = mysqlQueryBuilder.createQuery(rootNode);
            const query =
                '((user.id = :test_user_0) AND ((user.id = :test_user_1)))';
            expect(node.query).toBeDefined();
            expect(node.query).toBe(query);
        });
    });

    describe('variables depth test', () => {
        let rootNode: OperationNode;

        beforeAll(() => {
            const childNode: OperationNode = {
                table: 'user',
                alias: 'user',
                column: 'id',
                operation: Operation.EQUAL,
                value: 1,
                index: 1,
            };
            rootNode = {
                ...childNode,
                index: 0,
                child: childNode,
            };

            rootNode = mysqlQueryBuilder.createQuery(rootNode);
        });

        it('createQuery test', () => {
            const node = mysqlQueryBuilder.createVariables(rootNode);
            expect(node.variables).toBeDefined();
            expect(node.variables['test_user_1']).toBeDefined();
            expect(node.variables['test_user_0']).toBeDefined();
            expect(node.variables['test_user_1']).toBe(1);
            expect(node.variables['test_user_0']).toBe(1);
        });
    });
});
