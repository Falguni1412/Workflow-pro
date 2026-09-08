const bcrypt = require('bcryptjs');
const {
  sequelize,
  Role,
  Department,
  User,
  Workflow,
  WorkflowStep
} = require('../models');

async function seed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully. Syncing database schemas...');

    // Drop and re-create all tables
    await sequelize.sync({ force: true });
    console.log('Database synced. Seeding tables...');

    // 1. Seed Roles
    const rolesData = [
      { id: 1, name: 'Employee', permissions: ['profile.view', 'request.create', 'request.view_own'] },
      { id: 2, name: 'Manager', permissions: ['profile.view', 'request.create', 'request.view_own', 'request.approve', 'request.reject', 'request.send_back', 'analytics.view'] },
      { id: 3, name: 'HR', permissions: ['profile.view', 'request.create', 'request.view_own', 'request.approve', 'request.reject', 'employee.manage', 'department.manage', 'holiday.manage', 'attendance.view'] },
      { id: 4, name: 'Finance', permissions: ['profile.view', 'request.create', 'request.view_own', 'request.approve', 'request.reject', 'expense.verify', 'budget.manage', 'report.generate'] },
      { id: 5, name: 'Admin', permissions: ['profile.view', 'request.create', 'request.view_own', 'user.manage', 'role.manage', 'department.manage', 'audit.view', 'system.config'] },
      { id: 6, name: 'Super Admin', permissions: ['*'] }
    ];

    const roles = [];
    for (const r of rolesData) {
      const role = await Role.create(r);
      roles.push(role);
    }
    console.log('Seeded roles.');

    // 2. Seed Departments
    const departmentsData = [
      { id: 1, name: 'Executive', code: 'EXEC', budgetLimit: 500000.00 },
      { id: 2, name: 'Engineering', code: 'ENG', budgetLimit: 150000.00 },
      { id: 3, name: 'Human Resources', code: 'HR', budgetLimit: 50000.00 },
      { id: 4, name: 'Finance & Accounts', code: 'FIN', budgetLimit: 100000.00 }
    ];

    const departments = [];
    for (const d of departmentsData) {
      const dept = await Department.create(d);
      departments.push(dept);
    }
    console.log('Seeded departments.');

    // 3. Seed Users
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const usersData = [
      { name: 'Super Admin User', email: 'superadmin@enterprise.com', passwordHash: defaultPasswordHash, roleId: 6, departmentId: 1, status: 'Active' },
      { name: 'System Admin User', email: 'admin@enterprise.com', passwordHash: defaultPasswordHash, roleId: 5, departmentId: 1, status: 'Active' },
      { name: 'Finance Director', email: 'finance@enterprise.com', passwordHash: defaultPasswordHash, roleId: 4, departmentId: 4, status: 'Active' },
      { name: 'HR Executive', email: 'hr@enterprise.com', passwordHash: defaultPasswordHash, roleId: 3, departmentId: 3, status: 'Active' },
      { name: 'Engineering Manager', email: 'manager@enterprise.com', passwordHash: defaultPasswordHash, roleId: 2, departmentId: 2, status: 'Active' },
      { name: 'Software Engineer Employee', email: 'employee@enterprise.com', passwordHash: defaultPasswordHash, roleId: 1, departmentId: 2, status: 'Active' }
    ];

    const users = [];
    for (const u of usersData) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log('Seeded users.');

    // Update departments with manager ids
    // EXEC manager is Super Admin (1)
    await departments[0].update({ managerId: 1 });
    // ENG manager is Engineering Manager (5)
    await departments[1].update({ managerId: 5 });
    // HR manager is HR Executive (4)
    await departments[2].update({ managerId: 4 });
    // FIN manager is Finance Director (3)
    await departments[3].update({ managerId: 3 });

    // Update Employee's manager to Engineering Manager (5)
    await users[5].update({ managerId: 5 });
    // Update Engineering Manager's manager to Finance Director (3) or Super Admin (1)
    await users[4].update({ managerId: 1 });
    console.log('Updated user management hierarchies and department managers.');

    // 4. Seed Standard Workflows
    const workflowsData = [
      { id: 1, name: 'Standard Leave Approval Workflow', description: 'Request goes to direct Manager, then to HR, then final approval.', triggerType: 'Leave', isActive: true },
      { id: 2, name: 'Expense Reimbursement Workflow', description: 'Request goes to Manager, then to Finance for reimbursement processing.', triggerType: 'Expense', isActive: true },
      { id: 3, name: 'Travel Request Workflow', description: 'Request goes to Manager for operational approval, then Finance for booking budget confirmation.', triggerType: 'Travel', isActive: true }
    ];

    for (const w of workflowsData) {
      await Workflow.create(w);
    }
    console.log('Seeded workflows.');

    // 5. Seed Workflow Steps
    const workflowStepsData = [
      // Leave Steps
      { workflowId: 1, stepNumber: 1, approverRoleId: 2, slaHours: 24 }, // Manager Approval
      { workflowId: 1, stepNumber: 2, approverRoleId: 3, slaHours: 48 }, // HR Approval

      // Expense Steps
      { workflowId: 2, stepNumber: 1, approverRoleId: 2, slaHours: 24 }, // Manager Approval
      { workflowId: 2, stepNumber: 2, approverRoleId: 4, slaHours: 48 }, // Finance Approval

      // Travel Steps
      { workflowId: 3, stepNumber: 1, approverRoleId: 2, slaHours: 24 }, // Manager Approval
      { workflowId: 3, stepNumber: 2, approverRoleId: 4, slaHours: 48 }  // Finance Approval
    ];

    for (const s of workflowStepsData) {
      await WorkflowStep.create(s);
    }
    console.log('Seeded workflow steps.');

    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if file is executed directly
if (require.main === module) {
  seed();
}

module.exports = seed;
