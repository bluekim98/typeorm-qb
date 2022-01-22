import { EntityInfo } from '@src/parser/parser';
import { MysqlService } from './mysql.service';

class Team {
    id: number;
    name: string;
    users: User[];
}

class User {
    readonly id: number;
    readonly email: string;
    readonly teamId: number;
    readonly team: Team;
}

class UserService extends MysqlService<User> {
    constructor() {
        super();
    }

    protected getEntityInfo(): EntityInfo {
        return {
            table: 'user',
            alias: 'user',
        };
    }
}

describe('MysqlService', () => {
    const userService = new UserService();

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('makeWhere', () => {
        const whereDto = {
            id__in: [1, 2, 3],
            team: {
                name: 'Development',
            },
        };

        const where = userService.makeWhere(whereDto);
        expect(where.query).toBeDefined();
        expect(where.variables).toBeDefined();

        const keys = Object.keys(where.variables);
        for (const variables of keys) {
            expect(where.query.includes(`:${variables}`)).toBeTruthy();
        }
    });
});
