import prisma from '../prismaClient';
import { Account, Branch, Customer, Employee, Owns, Transactions } from '@prisma/client';

export class ProblemService {
    async solve (id: number): Promise<any> {
        console.log('problem solve for id:', id);
        switch (id) {
            case 1:
                return this.problem1 ();
            case 2:
                return this.problem2 ();
            case 3:
                return this.problem3 ();
            case 4:
                return this.problem4 ();
            case 5:
                return this.problem5 ();
            case 6:
                return this.problem6 ();
            case 7:
                return this.problem7 ();
            case 8:
                return this.problem8 ();
            case 9:
                return this.problem9 ();
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
        const result = await prisma.branch.findMany({
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
            const managerSalary = branch.Employee_Branch_managerSINToEmployee?.salary;
            return branch.Employee_Employee_branchNumberToBranch.map(employee => ({
                sin: employee.sin,
                branchName: branch.branchName,
                salary: employee.salary,
                'Salary Diff': managerSalary! - employee?.salary!,
            }));
        });

        return formatted.sort((a, b) => {
            return b['Salary Diff'] - a['Salary Diff'];
        }).slice(0, 10);
    }

    async problem3 () {
        const [butlerIncome, result] = await Promise.all([
            prisma.customer.findMany({
                select: {
                    income: true,
                },
                where: {
                    lastName: 'Butler',
                },
            }),
            prisma.customer.findMany({
                select: {
                    firstName: true,
                    lastName: true,
                    income: true,
                },
                orderBy: [
                    {
                        lastName: "asc",
                    },
                    {
                        firstName: "asc",
                    },
                ],
            }),
        ]);

        return result.filter(item => {
            const income = item.income;
            return butlerIncome.every(refItem => (refItem.income || 0) < (income || 0) / 2)
        }).slice(0, 10);
    }

    async problem4 () {
        const includeClause = {
            Customer: {
                select: {
                    customerID: true,
                    income: true,
                },
            },
            Account: {
                select: {
                    accNumber: true,
                    branchNumber: true,
                    Branch: {
                        select: {
                            branchName: true,
                        },
                    },
                },
            },
        };

        const whereClause = {
            Customer: {
                income: {
                    gte: 80000,
                },
            },
        };

        const ownsDetailed = await prisma.owns.findMany({
            include: includeClause,
            where: whereClause,
        });

        const london = ownsDetailed.filter(owns => {
            return (owns.Account.Branch?.branchName == 'London');
        });

        const latveria = ownsDetailed.filter(owns => {
            return (owns.Account.Branch?.branchName == 'Latveria');
        });

        const customerIDs = this.getIntersection(london, latveria, "customerID").map(owns => {
            return owns.customerID;
        });

        return ownsDetailed.filter(owns => {
            return customerIDs.some(refCustomerID => owns.customerID == refCustomerID)
        }).sort((a, b) => {
            return (a.customerID == b.customerID) ? (a.accNumber - b.accNumber) : (a.customerID - b.customerID);
        }).slice(0, 10).flatMap(owns => {
            return {
                customerID: owns.customerID,
                income: owns.Customer.income,
                accNumber: owns.accNumber,
                branchNumber: owns.Account.branchNumber,
            };
        });
    }

    async problem5 () {
        const ownsDetailed = await prisma.owns.findMany({
            include: {
                Customer: {
                    select: {
                        customerID: true,
                    },
                },
                Account: {
                    select: {
                        type: true,
                        accNumber: true,
                        balance: true,
                    },
                },
            },
            where: {
                Account: {
                    type: {
                        in: ['SAV', 'BUS'],
                    },
                },
            },
            orderBy: [
                {
                    Customer: {
                        customerID: "asc",
                    },
                },
                {
                    Account: {
                        type: "asc",
                    },
                },
                {
                    Account: {
                        accNumber: "asc",
                    }
                },
            ],
            take: 10,
        });

        return ownsDetailed.map(owns => {
            return {
                customerID: owns.customerID,
                type: owns.Account.type,
                accNumber: owns.accNumber,
                balance: owns.Account.balance,
            };
        });
    }

    async problem6 () {
        const target = await prisma.employee.findFirst({
            select: {
                sin: true,
            },
            where: {
                firstName: 'Phillip',
                lastName: 'Edwards',
            },
        })

        const accountWithBranch = await prisma.account.findMany({
            include: {
                Branch: {
                    select: {
                        branchName: true,
                    },
                },
            },
            where: {
                Branch: {
                    managerSIN: target?.sin,
                }
            },
            orderBy: {
                accNumber: "asc",
            },
        });

        return accountWithBranch.map(account => {
            return {
                branchName: account.Branch?.branchName,
                accNumber: account.accNumber,
                balance: account.balance,
            };
        }).filter(account => {
            return Number(account.balance) > 100000;
        }).slice(0, 10);
    }

    async problem7 () {
        const coOwnedAccounts = await prisma.owns.groupBy({
            by: ['accNumber'],
            _count: {
                customerID: true,
            },
            having: {
                customerID: {
                    _count: {
                        gte: 2,
                    }
                }
            },
        });

        const customerOwnsLondonAccounts = await prisma.owns.findMany({
            select: {
                customerID: true,
            },
            where: {
                Account: {
                    Branch: {
                        branchName: 'London',
                    },
                },
            },
        });

        const accountsLondonCustomerCoOwns = await prisma.owns.findMany({
            select: {
                accNumber: true,
            },
            where: {
                customerID: {
                    in: customerOwnsLondonAccounts.map(customer => {
                        return customer.customerID;
                    }),
                },
                accNumber: {
                    in: coOwnedAccounts.map(account => {
                        return account.accNumber;
                    })
                }
            },
        });

        const customerCoOwnsAccountsWithLondonCustomer = await prisma.owns.findMany({
            select: {
                customerID: true,
            },
            where: {
                accNumber: {
                    in: accountsLondonCustomerCoOwns.map(account => {
                        return account.accNumber;
                    }),
                },
            },
        })

        return prisma.owns.findMany({
            select: {
                customerID: true,
            },
            distinct: "customerID",
            where: {
                customerID: {
                    notIn: [...customerOwnsLondonAccounts, ...customerCoOwnsAccountsWithLondonCustomer].map(
                        customer => {
                            return customer.customerID;
                        }
                    ),
                },
                Account: {
                    Branch: {
                        branchName: 'New York',
                    },
                },
            },
            orderBy: {
                customerID: "asc",
            },
            take: 10,
        });
    }

    async problem8 () {
        const employees = await prisma.employee.findMany({
            include: {
                Branch_Employee_branchNumberToBranch: {
                    select: {
                        branchName: true,
                    },
                },
            },
            where: {
                salary: {
                    gte: 50000,
                },
            },
        });

        const managers = await prisma.branch.findMany({
            select: {
                managerSIN: true,
                branchName: true,
            },
        });

        const managerMap = new Map(managers.map(m => {
            return [m.managerSIN, m.branchName];
        }));

        return employees.map(employee => {

            const isManager = managers.some(manager => {
                return manager.managerSIN == employee.sin;
            });

            const branchName = isManager ? managerMap.get(employee.sin) : null;

            return {
                sin: employee.sin,
                firstName: employee.firstName,
                lastName: employee.lastName,
                salary: employee.salary,
                branchName: branchName,
            };
        }).sort((a, b) => {
            return (a.branchName == b.branchName) ?
                this.asciiDifferenceFlexible(a.firstName, b.firstName)
            :
                this.asciiDifferenceFlexible(b.branchName, a.branchName);
        }).slice(0, 10);
    }

    async problem9 () {
        return this.problem8 ();
    }

    asciiDifferenceFlexible (str1: string | null | undefined, str2: string | null | undefined): number {
        if (str1 && str2) {
            const minLength = Math.min(str1.length, str2.length);

            for (let i = 0; i < minLength; i++) {
                const char1 = str1.charCodeAt(i);
                const char2 = str2.charCodeAt(i);
                if (char1 !== char2) {
                    return char1 - char2;
                }
            }
            return str1.length - str2.length;
        } else if (!str1 && str2) {
            return -1;
        } else if (str1 && !str2) {
            return 1;
        } else {
            return 0;
        }
    }

    getIntersection<T>(array1: T[], array2: T[], ...keys: Array<keyof T>) {
        return array1.filter((obj1) =>
            array2.find((obj2) => keys.every((k) => obj1[k] === obj2[k]))
        );
    }
}