import prisma from '../prismaClient';
import { Account, Branch, Customer, Employee, Owns, Transactions } from '@prisma/client';

export class ProblemService {
    async solve (id: number): Promise<any> {
        console.log('problem solve for id:', id);
        switch (id) {
            case 1:
                return this.problem1();
            case 2:
                return this.problem2();
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
            case 10:
                break;
            case 11:
                break;
            case 14:
                break;
            case 15:
                break;
            case 17:
                break;
            case 18:
                break;
            default:
                throw new Error('invalid problem id');
        }
    }

    async problem1 () {
        return prisma.customer.findMany({
            select: {
                firstName: true,
                lastName: true,
                income: true,
            },
            where: {
                income: {
                    gte: 50000,
                    lte: 60000,
                },
            },
            orderBy: [
                {
                    income: 'desc',
                },
                {
                    lastName: 'asc',
                },
                {
                    firstName: 'asc',
                },
            ],
            take: 10,
        });
    }

    async problem2 () {
        let result = await prisma.branch.findMany({
            include: {
                Employee_Branch_managerSINToEmployee: {
                    select: {
                        salary: true,
                    },
                },
                Employee_Employee_branchNumberToBranch: {
                    select: {
                        sin: true,
                        salary: true,
                    },
                },
            },
            where: {
                branchName: {
                    in: ['London', 'Berlin'],
                },
            },
        });
        const formatted = result.flatMap(branch => {
            const managerSalary = branch.Employee_Branch_managerSINToEmployee?.salary || 0;
            return branch.Employee_Employee_branchNumberToBranch.map(employee => ({
                sin: employee.sin,
                branchName: branch.branchName,
                salary: employee.salary,
                'Salary Diff': managerSalary - (employee.salary || 0),
            }));
        });
        return formatted.sort((a, b) => b['Salary Diff'] - a['Salary Diff'])
            .slice(0, 10);
    }

    async problem3 () {}
}