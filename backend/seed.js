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

const facultyNames = [
  ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
  ['Dr. Priya Patel', 'Prof. Rahul Verma'],
  ['Dr. Emily Davis', 'Prof. David Kumar'],
  ['Dr. James Wilson', 'Prof. Anita Desai'],
  ['Dr. Robert Brown', 'Prof. Meera Singh']
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create 5 HODs (one for each department)
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      // Create unique staffId for each HOD
      const deptCode = dept.split(' ')[0].substring(0, 3).toUpperCase();
      const hod = new User({
        email: `${dept.split(' ')[0].toLowerCase()}.hod@college.edu`,
        password: 'password123',
        role: 'hod',
        staffId: `HOD-${deptCode}-${2024}${i}`, // Added index to make it unique
        personalDetails: {
          name: `Dr. ${dept.split(' ')[0]} Sharma`,
          designation: 'Professor & Head',
          department: dept,
          dateOfJoining: '15-06-2015',
          experience: '9 years',
          phone: `+91 98765${i}${i}${i}${i}`,
          officeRoom: `${deptCode}-${100 + i}`,
          qualifications: [`Ph.D. in ${dept.split(' ')[0]} Engineering`],
          researchAreas: ['Research Area 1', 'Research Area 2']
        },
        leaveBalance: {
          casualLeave: 12,
          medicalLeave: 15,
          earnedLeave: 30
        },
        hodOf: dept
      });

      await hod.save();
      console.log(`Created HOD: ${hod.personalDetails.name} (${hod.email}) - Staff ID: ${hod.staffId}`);
    }

    // Create 10 Faculty members (2 per department)
    for (let i = 0; i < 10; i++) {
      const deptIndex = Math.floor(i / 2);
      const dept = departments[deptIndex];
      const facultyNumber = (i % 2);
      const deptCode = dept.split(' ')[0].substring(0, 3).toUpperCase();
      
      // Clean email - remove special characters and spaces
      const cleanName = facultyNames[deptIndex][facultyNumber]
        .toLowerCase()
        .replace(/[^a-z]/g, '');
      
      const faculty = new User({
        email: `${cleanName}@college.edu`,
        password: 'password123',
        role: 'faculty',
        staffId: `FAC-${deptCode}-${2020 + i}`, // Unique staffId
        personalDetails: {
          name: facultyNames[deptIndex][facultyNumber],
          designation: i % 2 === 0 ? 'Associate Professor' : 'Assistant Professor',
          department: dept,
          dateOfJoining: `01-0${(i % 9) + 1}-2019`,
          experience: `${3 + (i % 5)} years`,
          phone: `+91 98765${i}${i}${i}${i + 1}`,
          officeRoom: `${deptCode}-${200 + i}`,
          qualifications: [`Ph.D. in ${dept.split(' ')[0]} Engineering`, 'M.Tech'],
          researchAreas: ['Machine Learning', 'Data Science']
        },
        leaveBalance: {
          casualLeave: 12,
          medicalLeave: 15,
          earnedLeave: 30
        },
        hodOf: null
      });

      await faculty.save();
      console.log(`Created Faculty: ${faculty.personalDetails.name} (${faculty.email}) - Staff ID: ${faculty.staffId}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('=====================');
    console.log('\n👨‍🏫 HOD Accounts (password: password123):');
    console.log('----------------------------------------');
    console.log('1. Dr. Computer Sharma (CSE HOD): computer.hod@college.edu');
    console.log('2. Dr. Electronics Sharma (ECE HOD): electronics.hod@college.edu');
    console.log('3. Dr. Electrical Sharma (EE HOD): electrical.hod@college.edu');
    console.log('4. Dr. Mechanical Sharma (ME HOD): mechanical.hod@college.edu');
    console.log('5. Dr. Civil Sharma (CE HOD): civil.hod@college.edu');
    
    console.log('\n👨‍🏫 Faculty Accounts (password: password123):');
    console.log('-------------------------------------------');
    console.log('1. Dr. Sarah Johnson: sarahjohnson@college.edu');
    console.log('2. Prof. Michael Chen: michaelchen@college.edu');
    console.log('3. Dr. Priya Patel: priyapatel@college.edu');
    console.log('4. Prof. Rahul Verma: rahulverma@college.edu');
    console.log('5. Dr. Emily Davis: emilydavis@college.edu');
    console.log('6. Prof. David Kumar: davidkumar@college.edu');
    console.log('7. Dr. James Wilson: jameswilson@college.edu');
    console.log('8. Prof. Anita Desai: anitadesai@college.edu');
    console.log('9. Dr. Robert Brown: robertbrown@college.edu');
    console.log('10. Prof. Meera Singh: meerasingh@college.edu');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();