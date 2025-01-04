import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import lodash from 'lodash'


const prisma = new PrismaClient()




function problem1() {
  return prisma.$queryRaw`
    select firstName, lastName, income from Customer 
    where income between 50000 and 60000 
    order by income desc, lastName asc, firstName asc 
    LIMIT 10;`
}

/*
  왜 CAST((m.salary - e.salary) as CHAR(10))으로 하지 않으면 Incorrect인가요?
*/

function problem2() {
  return prisma.$queryRaw`
    select e.sin, b.branchName, e.salary, CAST((m.salary - e.salary) AS char(10)) as 'Salary Diff'
    from Employee e
    join Branch b on e.branchNumber = b.branchNumber
    join Employee m on b.managerSIN = m.sin
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
    order by lastName asc, firstName asc
    LIMIT 10;
    `
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
    ), customer_owns_account_at_london as (
      select customerID from customer_owns_account_with_branch
      where branchName = 'London'
    ), customer_owns_account_at_latveria as (
      select customerID from customer_owns_account_with_branch
      where branchName = 'Latveria'
    ) select customerID, income, accNumber, branchNumber
    from customer_owns_account_with_branch
    where customerID in (select customerID from customer_owns_account_at_london)
      and customerID in (select customerID from customer_owns_account_at_latveria)
    order by customerID asc, accNumber asc
    LIMIT 10;
`
}

function problem5() {
  return prisma.$queryRaw`select * from Customer`
}

function problem6() {
  return prisma.$queryRaw`select * from Customer`
}

function problem7() {
  return prisma.$queryRaw`select * from Customer`
}

function problem8() {
  return prisma.$queryRaw`select * from Customer`
}

function problem9() {
  return prisma.$queryRaw`select * from Customer`
}

function problem10() {
  return prisma.$queryRaw`select * from Customer`
}

function problem11() {
  return prisma.$queryRaw`select * from Customer`
}

function problem14() {
  return prisma.$queryRaw`select * from Customer`
}

function problem15() {
  return prisma.$queryRaw`select * from Customer`
}


function problem17() {
  return prisma.$queryRaw`select * from Customer`
}

function problem18() {
  return prisma.$queryRaw`select * from Customer`
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