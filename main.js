import { generateAssistantResponse } from './services/geminiService.js';

// --- State Management ---
const state = {
  currentPage: 'HOME',
  mobileMenuOpen: false,
  chat: {
    isOpen: false,
    messages: [
      { role: 'model', text: 'Hello! I am the Greenville Virtual Assistant. How can I help you today?', timestamp: new Date() }
    ],
    isLoading: false
  }
};

// --- Utils ---
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
}

// --- Icons ---
const Icons = {
  menu: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>`,
  close: `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
  chat: `<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>`,
  location: `<svg class="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  phone: `<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`,
  mail: `<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`
};

// --- Components (Template Strings) ---

const Navbar = () => {
  const links = [
    { label: 'Home', page: 'HOME' },
    { label: 'About Us', page: 'ABOUT' },
    { label: 'Academics', page: 'ACADEMICS' },
    { label: 'Admissions', page: 'ADMISSIONS' },
    { label: 'Contact', page: 'CONTACT' },
  ];

  const linkClass = (page) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    state.currentPage === page
      ? 'text-school-green bg-green-50'
      : 'text-gray-600 hover:text-school-green hover:bg-gray-50'
  }`;

  return `
    <nav class="bg-white shadow-md sticky top-0 z-40 font-sans">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex-shrink-0 flex items-center cursor-pointer nav-link" data-page="HOME">
            <div class="w-10 h-10 bg-school-green rounded-full flex items-center justify-center text-white font-serif font-bold text-xl mr-3">G</div>
            <div>
              <h1 class="text-xl font-bold text-school-green font-serif">Greenville</h1>
              <span class="text-xs text-school-gold font-semibold tracking-widest uppercase">Intl. College</span>
            </div>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            ${links.map(l => `<button class="${linkClass(l.page)} nav-link" data-page="${l.page}">${l.label}</button>`).join('')}
            <button class="bg-school-green text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-900 transition-colors">Portal Login</button>
          </div>

          <div class="md:hidden flex items-center">
            <button id="mobile-menu-btn" class="text-gray-600 hover:text-school-green focus:outline-none">
              ${state.mobileMenuOpen ? Icons.close : Icons.menu}
            </button>
          </div>
        </div>
      </div>

      ${state.mobileMenuOpen ? `
        <div class="md:hidden bg-white border-t border-gray-100">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             ${links.map(l => `<button class="block w-full text-left px-3 py-2 rounded-md text-base font-medium nav-link ${state.currentPage === l.page ? 'text-school-green bg-green-50' : 'text-gray-600 hover:text-school-green hover:bg-gray-50'}" data-page="${l.page}">${l.label}</button>`).join('')}
             <button class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-school-green hover:bg-green-900 mt-4">Student Portal Login</button>
          </div>
        </div>
      ` : ''}
    </nav>
  `;
};

const Footer = () => `
  <footer class="bg-school-green text-white font-sans">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center mb-4">
               <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-school-green font-serif font-bold text-lg mr-2">G</div>
              <span class="font-serif font-bold text-xl">Greenville</span>
            </div>
            <p class="text-sm text-green-100 mb-4">Empowering the next generation of leaders through academic excellence and moral integrity.</p>
          </div>

          <div>
            <h3 class="text-school-gold font-bold uppercase tracking-wider text-sm mb-4">Quick Links</h3>
            <ul class="space-y-2 text-sm text-green-100">
              <li><button class="hover:text-white hover:underline nav-link" data-page="ABOUT">About Us</button></li>
              <li><button class="hover:text-white hover:underline nav-link" data-page="ACADEMICS">Curriculum</button></li>
              <li><button class="hover:text-white hover:underline nav-link" data-page="ADMISSIONS">Admissions</button></li>
              <li><button class="hover:text-white hover:underline nav-link" data-page="CONTACT">Contact</button></li>
            </ul>
          </div>

          <div>
            <h3 class="text-school-gold font-bold uppercase tracking-wider text-sm mb-4">Contact Info</h3>
            <ul class="space-y-3 text-sm text-green-100">
              <li class="flex items-start">${Icons.location} <span>12, Adeola Hope Street,<br/>Ikeja GRA, Lagos, Nigeria.</span></li>
              <li class="flex items-center">${Icons.phone} <span>+234 801 234 5678</span></li>
              <li class="flex items-center">${Icons.mail} <span>admissions@greenville.edu.ng</span></li>
            </ul>
          </div>

          <div>
             <h3 class="text-school-gold font-bold uppercase tracking-wider text-sm mb-4">Newsletter</h3>
             <p class="text-sm text-green-100 mb-4">Subscribe to our newsletter.</p>
             <form onsubmit="event.preventDefault()" class="flex">
               <input type="email" placeholder="Your email" class="px-3 py-2 rounded-l-md w-full text-gray-800 focus:outline-none" />
               <button class="bg-school-gold px-4 py-2 rounded-r-md text-white font-bold hover:bg-yellow-600 transition-colors">Go</button>
             </form>
          </div>
        </div>
        <div class="border-t border-green-800 mt-12 pt-8 text-center text-sm text-green-200">
          &copy; ${new Date().getFullYear()} Greenville International College. All Rights Reserved.
        </div>
      </div>
    </footer>
`;

// --- Pages ---

const HomePage = () => {
  const news = [
    { id: 1, title: "Inter-House Sports Competition 2024", date: "March 15, 2024", summary: "Red House emerges victorious in a thrilling finish at the National Stadium.", category: 'Sports' },
    { id: 2, title: "Entrance Examination Dates Announced", date: "April 2, 2024", summary: "First batch entrance exams for the 2024/2025 academic session scheduled for May 15th.", category: 'Academic' },
    { id: 3, title: "Science Fair Excellence", date: "February 28, 2024", summary: "Greenville students win Gold at the Lagos State STEM Robotics challenge.", category: 'Event' }
  ];

  return `
    <div class="animate-fade-in">
      <div class="relative bg-school-green h-[500px] sm:h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
        <div class="absolute inset-0">
          <img src="https://picsum.photos/1920/1080?grayscale&blur=2" alt="School Building" class="w-full h-full object-cover opacity-20" />
        </div>
        <div class="relative z-10 max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
            Nurturing <span class="text-school-gold">Excellence</span>, <br/> Building Character
          </h1>
          <p class="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Welcome to Greenville International College. A world-class learning environment in the heart of Lagos.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="px-6 py-2 rounded-md font-semibold bg-school-gold text-white hover:bg-yellow-700 nav-link" data-page="ADMISSIONS">Apply for Admission</button>
            <button class="px-6 py-2 rounded-md font-semibold border-2 border-school-green text-white border-white hover:bg-white hover:text-school-green nav-link" data-page="ABOUT">Take a Virtual Tour</button>
          </div>
        </div>
      </div>

      <div class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div class="p-6 rounded-lg bg-green-50">
              <div class="text-4xl font-bold text-school-green mb-2">100%</div>
              <p class="text-gray-600 font-medium">University Acceptance Rate</p>
            </div>
            <div class="p-6 rounded-lg bg-green-50">
              <div class="text-4xl font-bold text-school-green mb-2">25+</div>
              <p class="text-gray-600 font-medium">Years of Excellence</p>
            </div>
            <div class="p-6 rounded-lg bg-green-50">
              <div class="text-4xl font-bold text-school-green mb-2">15:1</div>
              <p class="text-gray-600 font-medium">Student-Teacher Ratio</p>
            </div>
          </div>
        </div>
      </div>

      <div class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div class="md:w-1/2">
             <img src="https://picsum.photos/600/600" alt="Principal" class="rounded-lg shadow-xl w-full object-cover h-96" />
          </div>
          <div class="md:w-1/2">
            <h2 class="text-3xl font-serif font-bold text-school-green mb-6">Welcome from the Principal</h2>
            <p class="text-gray-600 mb-6 leading-relaxed">
              "At Greenville, we believe every child is a unique masterpiece waiting to be unveiled. Our commitment goes beyond academic rigor; we strive to mold conscientious citizens who will lead with integrity in Nigeria and on the global stage. We invite you to join our thriving community."
            </p>
            <p class="font-bold text-gray-800 text-lg">Dr. (Mrs.) Funke Adebayo</p>
            <p class="text-school-gold font-medium">Principal</p>
          </div>
        </div>
      </div>

      <div class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-end mb-10">
            <h2 class="text-3xl font-serif font-bold text-gray-900">Latest News & Events</h2>
            <button class="text-school-green font-semibold hover:text-school-gold">View All News &rarr;</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${news.map(item => `
              <div class="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div class="h-48 bg-gray-200 overflow-hidden">
                   <img src="https://picsum.photos/500/300?random=${item.id}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div class="p-6">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold text-school-gold uppercase tracking-wide">${item.category}</span>
                    <span class="text-xs text-gray-500">${item.date}</span>
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">${item.title}</h3>
                  <p class="text-gray-600 text-sm mb-4">${item.summary}</p>
                  <button class="text-school-green text-sm font-semibold hover:underline">Read more</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
};

const AboutPage = () => `
  <div class="animate-fade-in bg-white min-h-screen pb-20">
    <div class="bg-school-green py-20 text-center text-white">
      <h1 class="text-4xl font-serif font-bold">About Us</h1>
    </div>
    <div class="max-w-4xl mx-auto px-4 py-16">
      <h2 class="text-2xl font-bold text-school-green mb-4">Our History</h2>
      <p class="text-gray-600 mb-8 leading-relaxed">
        Founded in 1998, Greenville International College started with a vision to provide world-class education with a blend of Nigerian cultural values. From a modest beginning with 50 students in Ikeja, we have grown into a premier institution with over 1000 students and alumni making waves globally.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div class="bg-green-50 p-8 rounded-lg border-l-4 border-school-green">
          <h3 class="text-xl font-bold text-school-green mb-4">Our Mission</h3>
          <p class="text-gray-700">To provide a holistic education that fosters academic excellence, critical thinking, and moral fortitude in a supportive environment.</p>
        </div>
        <div class="bg-yellow-50 p-8 rounded-lg border-l-4 border-school-gold">
          <h3 class="text-xl font-bold text-school-gold mb-4">Our Vision</h3>
          <p class="text-gray-700">To be the leading educational institution in Africa, raising global citizens who lead with integrity and innovation.</p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-school-green mb-4">Core Values</h2>
      <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
        <li>Excellence in all endeavors</li>
        <li>Integrity and Honesty</li>
        <li>Respect for diversity and culture</li>
        <li>Service to humanity</li>
        <li>Innovation and Creativity</li>
      </ul>
    </div>
  </div>
`;

const AcademicsPage = () => `
  <div class="animate-fade-in bg-white min-h-screen pb-20">
     <div class="bg-school-green py-20 text-center text-white">
      <h1 class="text-4xl font-serif font-bold">Academics</h1>
    </div>
    <div class="max-w-5xl mx-auto px-4 py-16">
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Curriculum</h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          We offer a broad and balanced curriculum that integrates the **Nigerian National Curriculum** with the **British National Curriculum**. This dual-pathway approach ensures our students are prepared for both local (WAEC, NECO, UTME) and international (IGCSE, SAT, IELTS) examinations.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
         <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
           <h3 class="text-xl font-bold text-school-green mb-4">Junior Secondary (JSS 1-3)</h3>
           <p class="text-gray-600 text-sm mb-4">Foundation years focusing on core subjects including Mathematics, English, Basic Science, and Introduction to Technology.</p>
           <ul class="text-sm text-gray-500 space-y-1">
             <li>• Basic Science & Technology</li>
             <li>• Pre-Vocational Studies</li>
             <li>• National Values</li>
             <li>• French & Music</li>
           </ul>
         </div>
         <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
           <h3 class="text-xl font-bold text-school-green mb-4">Senior Secondary (SSS 1-3)</h3>
           <p class="text-gray-600 text-sm mb-4">Students choose between Science, Art, and Commercial departments tailored to their career aspirations.</p>
           <ul class="text-sm text-gray-500 space-y-1">
             <li>• Physics, Chemistry, Biology</li>
             <li>• Literature, Government, CRS</li>
             <li>• Economics, Accounting, Commerce</li>
             <li>• Further Mathematics & Technical Drawing</li>
           </ul>
         </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Facilities</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${['Science Labs', 'ICT Centre', 'Library', 'Art Studio', 'Music Room', 'Sports Complex'].map((facility, i) => `
             <div class="relative h-40 rounded-lg overflow-hidden group">
               <img src="https://picsum.photos/400/300?random=${i + 10}" alt="${facility}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                 <span class="text-white font-bold text-lg">${facility}</span>
               </div>
             </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
`;

const AdmissionsPage = () => `
  <div class="animate-fade-in bg-white min-h-screen pb-20">
    <div class="bg-school-green py-20 text-center text-white">
      <h1 class="text-4xl font-serif font-bold">Admissions</h1>
    </div>
    <div class="max-w-4xl mx-auto px-4 py-16">
      <div class="bg-yellow-50 border-l-4 border-school-gold p-6 mb-12">
        <h3 class="text-lg font-bold text-school-gold mb-2">2024/2025 Admissions Open</h3>
        <p class="text-gray-700">Application forms are now available for JSS1 and transfer students into JSS2 and SSS1.</p>
      </div>

      <div class="space-y-12">
        <section>
          <h2 class="text-2xl font-bold text-school-green mb-4">Admission Process</h2>
          <div class="flex flex-col md:flex-row gap-6">
            ${[
              { step: 1, title: 'Purchase Form', desc: 'Obtain form online or at the school premises (₦10,000).' },
              { step: 2, title: 'Entrance Exam', desc: 'Sit for the CBT examination in Mathematics, English, and General Paper.' },
              { step: 3, title: 'Interview', desc: 'Successful candidates are invited for an oral interview with parents.' },
              { step: 4, title: 'Admission', desc: 'Receive offer letter and pay acceptance fee.' },
            ].map(s => `
              <div class="flex-1 text-center">
                <div class="w-10 h-10 bg-school-green text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">${s.step}</div>
                <h4 class="font-bold text-gray-900 mb-2">${s.title}</h4>
                <p class="text-xs text-gray-600">${s.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="bg-gray-50 p-8 rounded-lg">
          <h2 class="text-2xl font-bold text-school-green mb-6">Apply Online</h2>
          <form class="space-y-4" onsubmit="event.preventDefault()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Student's Full Name</label>
                <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Parent's Name</label>
                <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Parent's Email</label>
                <input type="email" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Class Applying For</label>
                <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green">
                  <option>JSS 1</option>
                  <option>JSS 2</option>
                  <option>SSS 1</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Parent's Phone</label>
                <input type="tel" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-school-green focus:border-school-green" />
              </div>
            </div>
            <div class="pt-4">
              <button class="w-full bg-school-green text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900">Submit Application Request</button>
            </div>
            <p class="text-xs text-gray-500 text-center mt-2">Note: This is a preliminary application. Official forms will be sent to your email.</p>
          </form>
        </section>
      </div>
    </div>
  </div>
`;

const ContactPage = () => `
   <div class="animate-fade-in bg-white min-h-screen pb-20">
    <div class="bg-school-green py-20 text-center text-white">
      <h1 class="text-4xl font-serif font-bold">Contact Us</h1>
    </div>
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p class="text-gray-600 mb-8">
            We are always happy to hear from you. Whether you are a prospective parent, an old student, or a member of the community, please reach out.
          </p>
          
          <div class="space-y-6">
            <div class="flex items-start">
               <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-school-green">
                     ${Icons.location}
                  </div>
               </div>
               <div class="ml-4">
                 <h3 class="text-lg font-bold text-gray-900">Visit Us</h3>
                 <p class="text-gray-600">12, Adeola Hope Street,<br/>Ikeja GRA, Lagos State.</p>
               </div>
            </div>
            <div class="flex items-start">
               <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-school-green">
                     ${Icons.phone}
                  </div>
               </div>
               <div class="ml-4">
                 <h3 class="text-lg font-bold text-gray-900">Call Us</h3>
                 <p class="text-gray-600">+234 801 234 5678<br/>+234 705 555 1212</p>
               </div>
            </div>
            <div class="flex items-start">
               <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-school-green">
                     ${Icons.mail}
                  </div>
               </div>
               <div class="ml-4">
                 <h3 class="text-lg font-bold text-gray-900">Email Us</h3>
                 <p class="text-gray-600">info@greenville.edu.ng<br/>admissions@greenville.edu.ng</p>
               </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-8 rounded-lg h-fit">
           <form class="space-y-4" onsubmit="event.preventDefault()">
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
               <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2" />
             </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <input type="email" class="w-full border border-gray-300 rounded-md px-3 py-2" />
             </div>
              <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
               <textarea rows="4" class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
             </div>
             <button class="w-full bg-school-green text-white px-6 py-2 rounded-md font-semibold hover:bg-green-900">Send Message</button>
           </form>
        </div>
      </div>
    </div>
  </div>
`;

// --- Chat Widget ---

const renderChat = () => {
  const container = document.getElementById('chat-container');
  
  if (!state.chat.isOpen) {
    container.innerHTML = `
      <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        <button id="chat-toggle-btn" class="flex items-center justify-center w-14 h-14 bg-school-green text-white rounded-full shadow-lg hover:bg-green-900 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-green">
          ${Icons.chat}
        </button>
      </div>
    `;
  } else {
    // Render the chat window
    // We only re-render the outer shell here if it doesn't exist to avoid clearing input
    // But for simplicity in this function we re-render full HTML string and rely on DOM event handling for updates
    const messagesHTML = state.chat.messages.map(msg => `
      <div class="flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-school-green text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}">
          ${escapeHTML(msg.text)}
        </div>
      </div>
    `).join('');

    const loadingHTML = state.chat.isLoading ? `
      <div class="flex justify-start mb-4">
        <div class="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        <div class="mb-4 w-80 sm:w-96 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-[500px] animate-fade-in-up">
          <div class="bg-school-green p-4 flex justify-between items-center text-white">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 class="font-bold">School Assistant</h3>
            </div>
            <button id="chat-close-btn" class="text-white hover:text-gray-200">
              ${Icons.chevronDown}
            </button>
          </div>
          
          <div id="chat-messages" class="flex-1 p-4 overflow-y-auto bg-gray-50 chat-scroll">
            ${messagesHTML}
            ${loadingHTML}
          </div>

          <form id="chat-form" class="p-3 bg-white border-t border-gray-200 flex">
            <input type="text" id="chat-input" placeholder="Ask about admissions, fees..." class="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-school-green focus:border-school-green text-sm" autocomplete="off" />
            <button type="submit" ${state.chat.isLoading ? 'disabled' : ''} class="bg-school-gold text-white px-4 py-2 rounded-r-md hover:bg-yellow-600 disabled:opacity-50 transition-colors">
              ${Icons.send}
            </button>
          </form>
        </div>
        <button id="chat-toggle-btn" class="hidden items-center justify-center w-14 h-14 bg-school-green text-white rounded-full shadow-lg">
          ${Icons.chat}
        </button>
      </div>
    `;

    // Scroll to bottom
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Restore focus
    const input = document.getElementById('chat-input');
    if(input && !state.chat.isLoading) input.focus();
  }

  attachChatEvents();
};

const attachChatEvents = () => {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const form = document.getElementById('chat-form');

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      state.chat.isOpen = !state.chat.isOpen;
      renderChat();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      state.chat.isOpen = false;
      renderChat();
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const inputEl = document.getElementById('chat-input');
      const text = inputEl.value.trim();
      
      if (!text || state.chat.isLoading) return;

      // Update UI with user message
      state.chat.messages.push({ role: 'user', text: text, timestamp: new Date() });
      state.chat.isLoading = true;
      renderChat();

      try {
        const historyForService = state.chat.messages.slice(0, -1).map(m => ({ role: m.role, text: m.text }));
        const responseText = await generateAssistantResponse(text, historyForService);
        state.chat.messages.push({ role: 'model', text: responseText, timestamp: new Date() });
      } catch (err) {
        console.error(err);
        state.chat.messages.push({ role: 'model', text: "Sorry, something went wrong.", timestamp: new Date() });
      } finally {
        state.chat.isLoading = false;
        renderChat();
      }
    };
  }
};


// --- Main Render & Router ---

const renderApp = () => {
  const app = document.getElementById('app');
  let content = '';

  switch (state.currentPage) {
    case 'HOME': content = HomePage(); break;
    case 'ABOUT': content = AboutPage(); break;
    case 'ACADEMICS': content = AcademicsPage(); break;
    case 'ADMISSIONS': content = AdmissionsPage(); break;
    case 'CONTACT': content = ContactPage(); break;
    default: content = HomePage();
  }

  app.innerHTML = `
    <div class="min-h-screen flex flex-col font-sans">
      ${Navbar()}
      <main class="flex-grow">
        ${content}
      </main>
      ${Footer()}
      <div id="chat-container"></div> 
    </div>
  `;
  
  // Re-attach listeners
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const page = e.currentTarget.getAttribute('data-page');
      if (page) {
        state.currentPage = page;
        state.mobileMenuOpen = false;
        window.scrollTo(0, 0);
        renderApp();
      }
    });
  });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.onclick = () => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
      renderApp();
    };
  }

  renderChat();
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});