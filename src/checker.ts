import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()

function problem1() {
  return prisma.$queryRaw`
    select firstName, lastName, income 
    from Customer 
    where income between 50000 and 60000 
    order by income desc, lastName, firstName 
    LIMIT 10;
  `;
}

function problem2() {
  return prisma.$queryRaw`
    select e.sin, b.branchName, e.salary, CAST((m.salary - e.salary) AS char(10)) as 'Salary Diff'
    from Employee e
      left join Branch b on e.branchNumber = b.branchNumber
      left join Employee m on b.managerSIN = m.sin
    where b.branchName in ('London', 'Berlin')
    order by (m.salary - e.salary) desc
    LIMIT 10;
  `;
}

function problem3() {
  return prisma.$queryRaw`
    select firstName, lastName, income
    from Customer c
    where income / 2 > all (
      select b.income
      from Customer b
      where b.lastName = 'Butler'
    )
    order by lastName, firstName
    LIMIT 10;
  `;
}

function problem4() {
  return prisma.$queryRaw`
    with customer_owns_account_with_branch as (
      select o.customerID, c.income, o.accNumber, a.branchNumber, b.branchName
      from Owns o
        left join Customer c on o.customerID = c.customerID
        left join Account a on o.accNumber = a.accNumber
        left join Branch b on a.branchNumber = b.branchNumber
      where c.income > 80000
    ) select customerID, income, accNumber, branchNumber
    from customer_owns_account_with_branch
    where customerID in (select c1.customerID from customer_owns_account_with_branch c1 where c1.branchName = 'London')
      and customerID in (select c2.customerID from customer_owns_account_with_branch c2 where c2.branchName = 'Latveria')
    order by customerID, accNumber
    LIMIT 10;
  `;
}

function problem5() {
  return prisma.$queryRaw`
    select o.customerID, a.type, o.accNumber, a.balance
    from Owns o
      left join Account a on o.accNumber = a.accNumber
    where a.type in ('SAV', 'BUS')
    order by o.customerID, a.type, o.accNumber
    LIMIT 10;
  `;
}

function problem6() {
  return prisma.$queryRaw`
    select b.branchName, a.accNumber, a.balance
    from Branch b
      left join Account a on b.branchNumber = a.branchNumber
    where a.balance > 100000
      and b.managerSIN = (select e.sin from Employee e where e.firstName = 'Phillip' and e.lastName = 'Edwards')
    order by a.accNumber
    LIMIT 10;
  `;
}

function problem7() {
  return prisma.$queryRaw`
    with customer_coowns_account_in_branch as (
      select c.customerID, co.customerID as coID, o.accNumber, b.branchName
      from Customer c
             left join Owns o on c.customerID = o.customerID
             left join Account a on o.accNumber = a.accNumber
             left join Branch b on a.branchNumber = b.branchNumber
             left join Owns co on o.accNumber = co.accNumber
    ) select DISTINCT(c3.customerID) from customer_coowns_account_in_branch c3
    where c3.customerID not in (
      select c2.customerID
      from customer_coowns_account_in_branch c2
      where c2.coID in (
        select c1.customerID
        from customer_coowns_account_in_branch c1
        where c1.branchName = 'London'
      )
    ) and c3.branchName = 'New York'
    order by customerID
      LIMIT 10;
  `;
}

function problem8() {
  return prisma.$queryRaw`
    select e.sin, e.firstName, e.lastName, e.salary, b.branchName
    from Employee e
      left outer join Branch b on e.branchNumber = b.branchNumber and e.sin = b.managerSIN
    where e.salary > 50000
    order by b.branchName desc, firstName 
    LIMIT 10
  `;
}

function problem9() {
  return prisma.$queryRaw`
    select e.sin, e.firstName, e.lastName, e.salary,
     (CASE WHEN e.sin = b.managerSIN THEN b.branchName END) as branchName
    from Employee e, Branch b
    where e.salary > 50000
      and e.branchNumber = b.branchNumber
    order by branchName desc, firstName
    LIMIT 10;
  `;
}

function problem10() {
  return prisma.$queryRaw`
    with helen_morgan_owns_at as (
      select DISTINCT(a.branchNumber)
      from Account a
             left join Owns o on a.accNumber = o.accNumber
             left join Customer c on o.customerID = c.customerID
      where c.firstName = 'Helen' and c.lastName = 'Morgan'
    ) select c.customerID, c.firstName, c.lastName, c.income
    from Customer c
    where not EXISTS (
      (
        select branchNumber
        from helen_morgan_owns_at h
      )
      except
      (
        select a1.branchNumber
        from Account a1
               left join Owns o1 ON a1.accNumber = o1.accNumber
        where o1.customerID = c.customerID
      )
    ) and income > 5000
    order by income desc
    LIMIT 10;
  `;
}

function problem11() {
  return prisma.$queryRaw`
    select sin, firstName, lastName, salary from Employee
    where salary <= all (
      select e2.salary from Employee e2
    );
  `;
}

function problem14() {
  return prisma.$queryRaw`
    select CAST(SUM(salary) as CHAR(10)) as 'sum of employees salaries' from Employee e
      left join Branch b on b.branchNumber = e.branchNumber
    where b.branchName = 'Moscow';
 `;
}

function problem15() {
  return prisma.$queryRaw`
    select c.customerID, c.firstName, c.lastName
    from Customer c
     left join Owns o on c.customerID = o.customerID
     left join Account a on o.accNumber = a.accNumber
    group by c.customerID, c.firstName, c.lastName
    having COUNT(DISTINCT(a.branchNumber)) = 4
    order by c.lastName, c.firstName
  `
}

function problem17() {
  return prisma.$queryRaw`
    select c.customerID, c.firstName, c.lastName, c.income, AVG(a.balance) as "average account balance"
    from Customer c
           left join Owns o on c.customerID = o.customerID
           left join Account a on a.accNumber = o.accNumber
    where c.lastName like 'S%e%'
    group by c.customerID
    having COUNT(DISTINCT(a.accNumber)) >= 3
    order by c.customerID;
  `;
}

function problem18() {
  return prisma.$queryRaw`
    select a.accNumber, a.balance, SUM(t.amount) as "sum of transaction amounts"
    from Account a
           left join Transactions t on a.accNumber = t.accNumber
           left join Branch b on a.branchNumber = b.branchNumber
    where b.branchName = 'Berlin'
    group by a.accNumber, a.balance
    having COUNT(DISTINCT (transNumber)) >= 10
    order by \`sum of transaction amounts\` 
    LIMIT 10;`
}

const ProblemList = [
  problem1, problem2, problem3, problem4, problem5, problem6, problem7, problem8, problem9, problem10,
  problem11, problem14, problem15, problem17, problem18
]


async function main() {
  for (let i = 0; i < ProblemList.length; i++) {
    const result = await ProblemList[i]()
    const answer =  JSON.parse(fs.readFileSync(`${ProblemList[i].name}.json`,'utf-8'));
    lodash.isEqual(result, answer) ? console.log(`${ProblemList[i].name}: Correct`) : console.log(`${ProblemList[i].name}: Incorrect`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })