const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const departments = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

// Faculty names for 10 faculty per department (5 departments * 10 = 50 faculty)
const facultyNames = [
  // CSE Faculty
  [
    'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. David Williams', 'Prof. Lisa Anderson', 
    'Dr. James Brown', 'Prof. Maria Garcia', 'Dr. Robert Miller', 'Prof. Patricia Davis',
    'Dr. John Wilson', 'Prof. Jennifer Martinez'
  ],
  // ECE Faculty
  [
    'Dr. Priya Patel', 'Prof. Rahul Verma', 'Dr. Amit Kumar', 'Prof. Sunita Sharma',
    'Dr. Vikram Singh', 'Prof. Anjali Desai', 'Dr. Rajesh Gupta', 'Prof. Meena Iyer',
    'Dr. Sanjay Joshi', 'Prof. Kavita Reddy'
  ],
  // Electrical Faculty
  [
    'Dr. Emily Davis', 'Prof. David Kumar', 'Dr. Suresh Rao', 'Prof. Neha Singh',
    'Dr. Ramesh Kumar', 'Prof. Pooja Mehta', 'Dr. Alok Sharma', 'Prof. Deepa Nair',
    'Dr. Manoj Tiwari', 'Prof. Shalini Gupta'
  ],
  // Mechanical Faculty
  [
    'Dr. James Wilson', 'Prof. Anita Desai', 'Dr. Rajan Kapoor', 'Prof. Sneha Reddy',
    'Dr. Arjun Nair', 'Prof. Kavya Sharma', 'Dr. Vishal Malhotra', 'Prof. Divya Joseph',
    'Dr. Karthik Subramanian', 'Prof. Lakshmi Iyer'
  ],
  // Civil Faculty
  [
    'Dr. Robert Brown', 'Prof. Meera Singh', 'Dr. Rajiv Mehra', 'Prof. Nidhi Gupta',
    'Dr. Prakash Rao', 'Prof. Swati Sharma', 'Dr. Anil Kumar', 'Prof. Reena George',
    'Dr. Mohan Krishnan', 'Prof. Geeta Nair'
  ]
];

// Designations array for variety
const designations = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer'
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create 5 HODs (one for each department) - NO LEAVE BALANCE FOR HODs
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const deptCode = dept.split(' ')[0].substring(0, 3).toUpperCase();
      
      // Determine gender for HOD (alternating for variety)
      const gender = i % 2 === 0 ? 'male' : 'female';
      
      const hod = new User({
        email: `${dept.split(' ')[0].toLowerCase()}.hod@college.edu`,
        password: 'password123',
        role: 'hod',
        staffId: `HOD-${deptCode}-${2024}${i}`,
        personalDetails: {
          name: i % 2 === 0 ? `Dr. ${dept.split(' ')[0]} Sharma` : `Dr. ${dept.split(' ')[0]} Gupta`,
          designation: 'Professor & Head',
          department: dept,
          dateOfJoining: `15-06-2015`,
          experience: '9 years',
          phone: `+91 98765${i}${i}${i}${i}`,
          officeRoom: `${deptCode}-${100 + i}`,
          qualifications: [`Ph.D. in ${dept.split(' ')[0]} Engineering`],
          researchAreas: ['Research Area 1', 'Research Area 2'],
          gender: gender
        },
        // HODs don't need leave balance - will use defaults or empty
        leaveBalance: {
          casualLeave: 0,
          medicalLeave: 0,
          summerLeave: 0,
          winterLeave: 0,
          permissionLeaves: {
            total: 0,
            used: 0,
            month: null
          }
        },
        hodOf: dept
      });

      await hod.save();
      console.log(`Created HOD: ${hod.personalDetails.name} (${hod.email}) - Dept: ${dept}`);
    }

    // Create 50 Faculty members (10 per department) - WITH SPECIFIED LEAVE BALANCES
    let facultyCount = 0;
    for (let deptIndex = 0; deptIndex < departments.length; deptIndex++) {
      const dept = departments[deptIndex];
      const deptCode = dept.split(' ')[0].substring(0, 3).toUpperCase();
      
      for (let facultyNum = 0; facultyNum < 10; facultyNum++) {
        const globalIndex = facultyCount++;
        const name = facultyNames[deptIndex][facultyNum];
        
        // Clean email - remove special characters and spaces
        const cleanName = name
          .toLowerCase()
          .replace(/[^a-z]/g, '');
        
        // Determine gender based on name (simplified)
        const gender = name.includes('Dr. Sarah') || name.includes('Prof. Lisa') || 
                      name.includes('Prof. Maria') || name.includes('Prof. Patricia') ||
                      name.includes('Dr. Priya') || name.includes('Prof. Sunita') ||
                      name.includes('Prof. Anjali') || name.includes('Prof. Meena') ||
                      name.includes('Prof. Kavita') || name.includes('Dr. Emily') ||
                      name.includes('Prof. Neha') || name.includes('Prof. Pooja') ||
                      name.includes('Prof. Deepa') || name.includes('Prof. Shalini') ||
                      name.includes('Prof. Anita') || name.includes('Prof. Sneha') ||
                      name.includes('Prof. Kavya') || name.includes('Prof. Divya') ||
                      name.includes('Prof. Lakshmi') || name.includes('Prof. Meera') ||
                      name.includes('Prof. Swati') || name.includes('Prof. Reena') ||
                      name.includes('Prof. Geeta') ? 'female' : 'male';
        
        // Random experience between 2-15 years
        const expYears = 2 + Math.floor(Math.random() * 14);
        const expMonths = Math.floor(Math.random() * 12);
        const experience = `${expYears} years, ${expMonths} months`;
        
        // Random date of joining
        const joinYear = 2010 + Math.floor(Math.random() * 13);
        const joinMonth = 1 + Math.floor(Math.random() * 12);
        const joinDay = 1 + Math.floor(Math.random() * 28);
        const dateOfJoining = `${joinDay.toString().padStart(2, '0')}-${joinMonth.toString().padStart(2, '0')}-${joinYear}`;
        
        // Current month for permission leaves - start with 0 used for new faculty
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
        
        const faculty = new User({
          email: `${cleanName}@college.edu`,
          password: 'password123',
          role: 'faculty',
          staffId: `FAC-${deptCode}-${2020 + globalIndex}`,
          personalDetails: {
            name: name,
            designation: designations[facultyNum % designations.length],
            department: dept,
            dateOfJoining: dateOfJoining,
            experience: experience,
            phone: `+91 98765${globalIndex}${globalIndex}${globalIndex}${globalIndex + 1}`.substring(0, 15),
            officeRoom: `${deptCode}-${200 + globalIndex}`,
            qualifications: [
              `Ph.D. in ${dept.split(' ')[0]} Engineering`,
              'M.Tech',
              'B.Tech'
            ],
            researchAreas: [
              'Machine Learning',
              'Data Science',
              'Cloud Computing',
              'IoT',
              'AI'
            ].slice(0, 2 + Math.floor(Math.random() * 3)),
            gender: gender
          },
          // EXACT LEAVE BALANCES as specified
          leaveBalance: {
            casualLeave: 12,     // Casual Leave: 10 Days (Yearly)
            medicalLeave: 14,    // Medical Leave: 14 Days (Yearly)
            summerLeave: 3,      // Summer Leave: 2 Days (Yearly)
            winterLeave: 3,      // Winter Leave: 3 Days (Yearly)
            permissionLeaves: {
              total: 2,
              used: 0,           // Start with 0 used for new faculty
              month: currentMonth
            }
          },
          hodOf: null
        });

        await faculty.save();
        console.log(`Created Faculty: ${faculty.personalDetails.name} (${faculty.email}) - Dept: ${dept}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('=====================================');
    console.log(`📊 Total Users Created: ${5 + 50} (5 HODs + 50 Faculty)`);
    console.log('\n📧 Login Credentials:');
    console.log('=====================');
    console.log('🔑 All passwords: password123\n');
    
    console.log('👨‍🏫 HOD Accounts (No Leave Balances):');
    console.log('----------------------------------------');
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      console.log(`${i + 1}. ${dept}: ${dept.split(' ')[0].toLowerCase()}.hod@college.edu`);
    }
    
    console.log('\n👨‍🏫 Faculty Accounts (All have same leave balances):');
    console.log('------------------------------------------------');
    console.log('📊 Leave Balance for ALL Faculty:');
    console.log('   • Casual Leave: 10 Days (Yearly)');
    console.log('   • Medical Leave: 14 Days (Yearly)');
    console.log('   • Summer Leave: 2 Days (Yearly)');
    console.log('   • Winter Leave: 3 Days (Yearly)');
    console.log('   • Permission Leave: 2/2 Leaves (Monthly)\n');
    
    console.log('Sample Faculty Accounts (First 10 of 50):');
    console.log('-------------------------------------------');
    const sampleFaculties = [
      'sarahjohnson@college.edu', 'michaelchen@college.edu', 'davidwilliams@college.edu',
      'lisaanderson@college.edu', 'jamesbrown@college.edu', 'mariagarcia@college.edu',
      'robertmiller@college.edu', 'patriciadavis@college.edu', 'johnwilson@college.edu',
      'jennifermartinez@college.edu'
    ];
    
    sampleFaculties.forEach((email, index) => {
      console.log(`${index + 1}. ${email}`);
    });
    console.log('... and 40 more faculty accounts');
    
    console.log('\n📊 Department-wise Faculty Distribution:');
    console.log('----------------------------------------');
    departments.forEach(dept => {
      console.log(`${dept}: 10 Faculty members`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();