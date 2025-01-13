import prisma from '../prismaClient';
import Util from "../util";

export class EmployeeService {
    async join ({ sin, firstName, lastName, salary, branchNumber }: {
        sin: number, firstName: string, lastName: string, salary: number, branchNumber: number,
    }) {
        await prisma.employee.create({
            data: { sin, firstName, lastName, salary, branchNumber, },
        });
    }
}

export default EmployeeService;