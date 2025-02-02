import React from "react";
import image56 from "../assets/images/pexels-ekoagalarov-14865728.jpg"
import {useState} from "react"
import Card from "./Card"
import Exprience from "./Exprience"
import ProjectCard from "./Project"
import { ChevronLeft, X, Star,ChevronRight } from 'lucide-react';
import { Mail, Linkedin, Github, Briefcase } from "lucide-react";
import image60 from "../assets/images/icons8-java-144.png"
import image61 from "../assets/images/icons8-javascript-144.png"
import image62 from "../assets/images/icons8-figma-96.png"
import image63 from "../assets/images/icons8-content-100.png"
import image64 from "../assets/images/icons8-node-js-144.png"
import image65 from "../assets/images/icons8-react-native-256.png" 
import image66 from "../assets/DALL·E 2025-02-01 10.15.49 - A modern and visually stunning e-commerce website cover. The image should feature an elegant online shopping theme with a sleek laptop or smartphone d.webp"
import image67 from "../assets/developer_setup_grayscale.png"
import image68 from "../assets/images/StockCake-Futuristic Visionary Fashion_1725943062.jpg"
import RotatingNumber from "./Rotate";
const Port = () => {
    const [count, setCount] = useState(0);
    const [desiredNumber, setDesiredNumber] = useState(null);
    const [number, setNumber] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const Numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const [rating, setRating] = useState(4);
       
       const ratings = [
        { id: 1, totalStars: 5 }, // First div with 4 stars
        { id: 2, totalStars: 4 }, // Second div with 2 stars
        { id: 3, totalStars: 3 }, // Third div with 5 stars
      ];

    const handleCardClick =()=>{
        console.log("clicked")
    }
     const contact = +256758295130
    const handleCopy = () => {
      navigator.clipboard.writeText(contact)
        .then(() => {
          alert('Contact copied to clipboard!');
        })
        .catch((error) => {
          alert('Failed to copy contact: ' + error);
        });
    };
    const projects = [
      {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-stack e-commerce app with React, Node.js, and MySQL.",
        image:image66,
      },
      {
        id: 2,
        title: "AI Chatbot",
        description: "An AI-powered chatbot built using OpenAI's API and Next.js.",
        image:image67,
      },
      {
        id: 3,
        title: "Virtual Reality Apps",
        description: "A personal portfolio built with React and Tailwind CSS.",
        image:image68,
      },
      {
        id: 4,
        title: "Task Management App",
        description: "A project management tool with real-time collaboration features.",
        image:image56,
      },
    ];
    const handleNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cards);
    };
  const cards = 7;
    const handlePrev = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? cards - 1 : prevIndex - 1
      );
    };
    
  
    return (
      <div className="bg-purple-900 min-h-screen font-sans">
        <header className="bg-gradient-to-r sticky top-0 from-purple-900 z-10 via-blue-500 to-purple text-white py-6">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex gap-8">
              <img className="rounded-full ml-8 h-[55px] w-[55px] object-cover " src ={image67} alt="logo"/>
            <h1 className="text-3xl font-bold">Moses M</h1>
            </div>
            <nav>
              <ul className="flex space-x-8  items-center">
                <li><a href="#about" className="hover:underline px-3 hover:bg-blue-500 py-2 italic rounded text-2xl">About</a></li>
                <li><a href="#projects" className="hover:underline hover:bg-blue-500 px-3 py-2 italic rounded text-2xl">Projects</a></li>
                <li><a href="#contact" className="hover:underline hover:bg-blue-500 px-3 py-2 italic rounded text-2xl">Contact</a></li>
                <li><a href="#contact" className="hover:underline hover:bg-blue-500 px-3 py-2 italic rounded text-2xl">Experience</a></li>
                <li><button className="px-4 py-2 border border-transparent hover:bg-purple-400 hover:text-black hover:border-blue-500 rounded-full bg-purple-700 text-white text-lg">Hire Me</button></li>
              </ul>
            </nav>
          </div>
        </header>
  
        <section id="about" className="container rounded-md border-r border-l border-b px-4 py-4 border-purple-800 mt-8  mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold mb-4 text-white underline">About Me</h2>
          <div className="flex flex-row mt-4 space-x-16">
            <div className="text-gray-200 max-w-[50%] leading-relaxed">
              <h3 className="text-4xl font-bold text-purple-300">Web Developer +</h3>
              <h3 className="text-4xl font-bold text-purple-300">Software Developer</h3>
              <div className="relative mt-8 p-2">
      
            
              <p className="text-3xl  text-black mt-4">
                Hello!<strong className ="text-white"> I'm Moses Mpirirwe, a passionate software developer  </strong> specializing in React and full-stack development. With a keen eye for detail and a drive for excellence, I build seamless and user-friendly applications.
              </p>
              </div>
              <ul className="flex flex-wrap items-center justify-center space-x-6 mt-[200px]">
  <li>
    <a href="mailto:john.doe@example.com" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gradient-to-l from-purple-900 to-blue-500 text-blue-400 hover:text-white">
      <Mail />
      <span className ="text-xl font-sans ">Email</span>
    </a>
  </li>
  <li>
    <a href="https://linkedin.com/in/johndoe" className="flex items-center space-x-2 text-blue-400 py-2 px-3 rounded-md hover:bg-gradient-to-l from-purple-900 to-blue-500 hover:text-white">
      <Linkedin />
      <span className ="text-xl font-sans ">LinkedIn</span>
    </a>
  </li>
  <li>
    <a href="https://github.com/johndoe" className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gradient-to-l from-purple-900 to-blue-500 text-gray-300 hover:text-white">
      <Github />
      <span className ="text-xl font-sans ">GitHub</span>
    </a>
  </li>
  <li>
    <a href="#" className="flex items-center space-x-2 hover:bg-gradient-to-l py-2 px-3 rounded-md from-purple-900 to-blue-500 text-green-400 hover:text-white">
      <Briefcase />
      <span className ="text-xl font-sans ">Portfolio</span>
    </a>
  </li>
  <li>
    <button className="rounded-full px-6 py-2 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700">Download CV</button>
  </li>
</ul>

            </div>
            <div className="relative w-[400px] h-[400px]">
  <img
    className="rounded-lg absolute top-0 right-16 object-cover h-[400px] w-[400px] rotate-[10deg] transition-transform duration-300 ease-in hover:z-10"
    src={image68}
    alt="profile"
  />
  <img
    className="rounded-lg absolute top-0 right-4 object-cover h-[400px] w-[400px] rotate-[-10deg] transition-transform duration-300 ease-in hover:z-10"
    src={image56}
    alt="profile"
  />
  <img
    className="rounded-lg absolute top-0 right-8 object-cover h-[400px] w-[400px] rotate-[0deg] transition-transform duration-300 ease-in hover:z-10"
    src={image67}
    alt="profile"
  />
</div>

          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold"><RotatingNumber finalNumber={25}/>+</h2>
              <span className="text-lg">Projects</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold "><RotatingNumber finalNumber={200}/>+</h2>
              <span className="text-lg">Happy Clients</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold"><RotatingNumber finalNumber={5}/>+</h2>
              <span className="text-lg">Years of Experience</span>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold"><RotatingNumber finalNumber={15}/>+</h2>
              <span className="text-lg">Certifications</span>
            </div>
          </div>
        </section>
        <section id="services" className="container mx-auto px-4 py-10">
        <h2 className="text-center text-black text-3xl font-extrabold mb-6">My Services</h2>
        <hr className="mb-10 mx-auto w-1/3 bg-gray-100"/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-purple-800 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-2xl font-bold mb-2">Web Development</h3>
            <p className="text-xl">Building responsive and high-quality websites with modern technologies.</p>
            <span className="block mt-4 text-2xl text-gray-900">2 years of experience</span>
            <p>Rating Myself:</p>
      {<div>
          <div className="flex">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex-row">
                <Star
                  className={`w-6 h-6 transition-all duration-300 ${
                    index < ratings[0].totalStars ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-2xl text-gray-400">Rating: {ratings[0].totalStars} out of 5</p>
        </div>
      }
            
                    
                   
              
                
          </div>
          <div className="bg-purple-800 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-2xl font-bold mb-2">Content Creation</h3>
            <p className="text-xl">Producing engaging and high-quality content for various platforms.</p>
            <span className="block text-2xl mt-4 text-2xl text-gray-900">2 years of experience</span>
            <p>Rating  Myself :</p>
      {<div>
          <div className="flex">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex-row">
                <Star
                  className={`w-6 h-6 transition-all duration-300 ${
                    index < ratings[1].totalStars ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-2xl text-gray-400">Rating: {ratings[1].totalStars} out of 5</p>
        </div>
      }
          </div>
         
          <div className="bg-purple-800 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-2xl font-bold mb-2">UX/UI Design</h3>
            <p className="text-xl">Creating intuitive and user-friendly interfaces for better user experiences.</p>
            <span className="block mt-4 text-2xl text-gray-900">2 years of experience</span>
            <p>Rating Myself:</p>
      {<div>
          <div className="flex">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex-row">
                <Star
                  className={`w-6 h-6 transition-all duration-300 ${
                    index < ratings[2].totalStars ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-2xl text-gray-400">Rating: {ratings[2].totalStars} out of 5</p>
        </div>
      }
          </div>
          <div className="bg-purple-800 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-2xl font-bold mb-2">SEO Expert</h3>
            <p className="text-xl">Optimizing websites to rank higher on search engines and increase visibility.</p>
            <span className="block mt-4 text-2xl text-gray-900">2 years of experience</span>
            <p>Rating Myself:</p>
      {<div>
          <div className="flex">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex-row">
                <Star
                  className={`w-6 h-6 transition-all duration-300 ${
                    index < ratings[0].totalStars ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-2xl text-gray-400">Rating: {ratings[0].totalStars} out of 5</p>
        </div>
      }
          </div>
        </div>
      </section>
  

      <section id="projects" className="py-16 ">
      {/* Section Header */}
      <h1 className="text-center text-black text-4xl font-extrabold mb-6 font-[Poppins]">
        My Recent Projects
      </h1>
      <hr className="bg-gray-900 w-1/4 h-1 rounded-full mb-10 mx-auto" />

      {/* Buttons */}
      <div className="flex justify-center space-x-6">
        <button className="rounded-full px-8 py-3 w-[200px] text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md transition-all duration-300 hover:shadow-[0_0_15px_5px_rgba(128,0,255,0.6)] hover:scale-105">
          Apps
        </button>
        <button className="rounded-full px-8 py-3 w-[200px] text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md transition-all duration-300 hover:shadow-[0_0_15px_5px_rgba(128,0,255,0.6)] hover:scale-105">
          Content
        </button>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto grid lg:grid-cols-2 md:grid-cols-2 gap-8 px-6 mt-10">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative flex flex-col items-center bg-purple-900 rounded-xl shadow-lg p-8 overflow-hidden hover:shadow-[0_0_20px_5px_rgba(128,0,255,0.8)] transition-shadow duration-300"
          >
            {/* Project Title (Absolute Positioning) */}
            <h2 className="absolute top-10 z-10 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-red-400 drop-shadow-lg font-[Poppins]">
              {project.title}
            </h2>

            {/* Project Card Component */}
            <ProjectCard id={project.id} title={project.title} description={project.description} image={project.image} />
          </div>
        ))}
      </div>
    </section>
      <div className="skills-section py-12">
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-center text-black text-3xl font-extrabold mb-6">My Skills</h2>
    <hr className="mb-10 mx-auto w-1/3 bg-gray-100"/>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
      {/* React */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add React Icon/Image here */}
          <img src={image65} alt="react" className= "w-full h-full object-cover rounded-full"/>
        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">90%</span></strong>
        <p className="mt-2 text-xl">React</p>
      </div>

      {/* JavaScript */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add JavaScript Icon/Image here */}
          <img src={image61} alt="react" className= "w-full h-full object-cover rounded-full"/>

        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">95%</span></strong>
        <p className="mt-2 text-xl">JavaScript</p>
      </div>

      {/* Java */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add Java Icon/Image here */}
          <img src={image60} alt="react" className= "w-full h-full object-cover rounded-full"/>

        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">85%</span></strong>
        <p className="mt-2 text-xl">Java</p>
      </div>

      {/* Figma */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add Figma Icon/Image here */}
          <img src={image62} alt="react" className= "w-full h-full object-cover rounded-full"/>

        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">80%</span></strong>
        <p className="mt-2 text-xl">Figma</p>
      </div>

      {/* Git */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add Git Icon/Image here */}
          <img src={image65} alt="react" className= "w-full h-full object-cover rounded-full"/>

        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">95%</span></strong>
        <p className="mt-2 text-xl">Git</p>
      </div>

      {/* Node */}
      <div className="skill-item text-center">
        <div className="skill-icon bg-gray-200 w-16 h-16 mx-auto rounded-full">
          {/* Add Node.js Icon/Image here */}
          <img src={image64} alt="react" className= "w-full h-full object-cover rounded-full"/>

        </div>
        <strong className="flex gap-4 justify-center"><p className="text-blue-500">Rate:</p><span className="text-white bold">90%</span></strong>
        <p className="mt-2 text-xl">Node</p>
      </div>
    </div>
  </div>
</div>
<section className= "mt-4 ">


<div className="max-w-6xl mx-auto px-4">
<h2 className="text-center text-black text-3xl font-extrabold mb-6">My Testimonials</h2>
<hr className="mb-10  mx-auto w-1/3 bg-gray-100"/>
<div className="relative w-full flex items-center justify-center">
      <ChevronLeft
        onClick={handlePrev}
        className="absolute left-0  hover:scale-110  transition-transform hover:text-blue-500  h-20 w-20 text-2xl p-2 text-white"
      />
      <div className="overflow-hidden w-[900px] flex gap-4">
        <div
          className="flex transition-transform  gap-8 duration-500"
          style={{ transform: `translateX(-${currentIndex * 300}px)` }}
        >
<Card
        image={image68}
        title="Ahmed , Producer Mega Solutions "
        description="This is a brief description of the project."
        
      />
      <Card
        image={image56}
        title="Mr Peter, CEO infinite"
        description={`
          Working with Moses was an absolute pleasure. 
          He developed a custom CRM system that not only streamlined our
          operations but also helped us connect with our clients better. 
          His attention to detail and clear communication ensured that our 
          project was done on time and exceeded expectations. 
          The software is live and functioning smoothly, and we couldn’t be happier with the 
          results. I highly recommend Moses for anyone seeking reliable, top-notch software development, 
          and we will definitely be working with him again in the future.
        `}
        
      />
      <Card
        image={image56}
        title="Madam Rachael , Rise Children Africa"
        description={`
          Working with Moses was an absolute pleasure. 
          He developed a custom CRM system that not only streamlined our
          operations but also helped us connect with our clients better. 
          His attention to detail and clear communication ensured that our 
          project was done on time and exceeded expectations. 
          The software is live and functioning smoothly, and we couldn’t be happier with the 
          results. I highly recommend Moses for anyone seeking reliable, top-notch software development, 
          and we will definitely be working with him again in the future.
        `}
        
      />
      <Card
        image={image56}
        title="Mr Michael , Fintech Ug"
        description={`
          Working with Moses was an absolute pleasure. 
          He developed a custom CRM system that not only streamlined our
          operations but also helped us connect with our clients better. 
          His attention to detail and clear communication ensured that our 
          project was done on time and exceeded expectations. 
          The software is live and functioning smoothly, and we couldn’t be happier with the 
          results. I highly recommend Moses for anyone seeking reliable, top-notch software development, 
          and we will definitely be working with him again in the future.
        `}
      />
      <Card
        image={image56}
        title="Mr John Patrick from Asto Holdings"
        description={`
          Working with Moses was an absolute pleasure. 
          He developed a custom CRM system that not only streamlined our
          operations but also helped us connect with our clients better. 
          His attention to detail and clear communication ensured that our 
          project was done on time and exceeded expectations. 
          The software is live and functioning smoothly, and we couldn’t be happier with the 
          results. I highly recommend Moses for anyone seeking reliable, top-notch software development, 
          and we will definitely be working with him again in the future.
        `}
        
      />
      <Card
        image={image56}
        title="Mrs.Augustine , Lead Pastor Church LLMs"
        description={`
          Working with Moses was an absolute pleasure. 
          He developed a custom CRM system that not only streamlined our
          operations but also helped us connect with our clients better. 
          His attention to detail and clear communication ensured that our 
          project was done on time and exceeded expectations. 
          The software is live and functioning smoothly, and we couldn’t be happier with the 
          results. I highly recommend Moses for anyone seeking reliable, top-notch software development, 
          and we will definitely be working with him again in the future.
        `}
        
      />
      </div>
      </div>
      <ChevronRight
        onClick={handleNext}
        className="absolute right-0 h-20 w-20 p-2 text-white hover:scale-110  transition-transform hover:text-blue-500 rounded-full "
      />
    </div>
    </div>
      
</section>
<section id="experience" className="mt-[100px] border border-purple-800 py-3 w-full">
<h2 className="text-center text-black text-3xl font-extrabold mb-6">My Education and Experience </h2>
<hr className="mb-10 mx-auto w-1/3 bg-gray-100"/>
  <div className="p-4 flex flex-col lg:flex-row gap-12 mt-[100px]">
    {/* Experience Section */}
    <div className="flex-1">
      <h3 className="text-3xl text-center font-bold mb-6">Experience</h3>
      <div className="space-y-6">
        <Exprience title="Web Developer" description="Developed responsive websites using modern web technologies." period="Aug 2022 - Dec 2022" />
        <Exprience title="Frontend Developer Intern" description="Collaborated with designers to create interactive UI components." period="Jan 2023 - May 2023" />
        <Exprience title="Freelance Web Developer" description="Built e-commerce websites and optimized them for performance." period="Jun 2023 - Sep 2023" />
        <Exprience title="Software Engineer" description="Contributed to full-stack applications for startups and enterprises." period="Oct 2023 - Present" />
        <Exprience title="Tech Blogger" description="Created articles on web development best practices and tutorials." period="Dec 2023 - Present" />
      </div>
    </div>

    {/* Education Section */}
    <div className="flex-1">
      <h3 className="text-3xl ml-4 text-center  font-bold mb-6">Education</h3>
      <div className="space-y-6">
        <Exprience title="Bachelor of Software Engineering" description="Studying core software engineering concepts at Makerere University." period="Jan 2024 - Present" />
        <Exprience title="Web Development Certification" description="Completed an advanced course on modern web technologies." period="Aug 2022 - Dec 2022" />
        <Exprience title="Data Structures and Algorithms" description="Gained a deep understanding of DSA in an intensive training program." period="Jan 2023 - May 2023" />
        <Exprience title="React and Full-Stack Development" description="Mastered building React applications and REST APIs." period="Jun 2023 - Sep 2023" />
        <Exprience title="High School Diploma" description="Achieved a strong foundation in science and mathematics." period="Graduated Dec 2021" />
      </div>
    </div>
  </div>
</section>



    
        
        <section id="contact" className="mt-8 w-full">
        
  <h2 className="text-3xl py-8 text-center container font-semibold ">Contact Me</h2>
  <hr className ="w-1/2 bg-black mx-auto"/>
  <p className="text-black my-8 text-center">Feel free to reach out to me through any of the platforms below:</p>

  <div className="flex justify-center gap-16">
    {/* Facebook Icon */}
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-blue-600">
        <path d="M22 12a10 10 0 1 0-11.64 9.85v-6.97H8.1v-2.88h2.26V9.76c0-2.22 1.32-3.44 3.33-3.44.97 0 1.98.17 1.98.17v2.18h-1.12c-1.1 0-1.45.68-1.45 1.37v1.65h2.49l-.4 2.88h-2.1v6.97A10 10 0 0 0 22 12Z" />
      </svg>
    </a>
    {/* Twitter Icon */}
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-sky-500">
        <path d="M19.46 7.42c.01.15.01.3.01.46 0 4.7-3.57 10.11-10.11 10.11A10.07 10.07 0 0 1 2 15.59a7.19 7.19 0 0 0 5.29-1.48 3.58 3.58 0 0 1-3.34-2.48c.55.1 1.1.1 1.66-.06a3.57 3.57 0 0 1-2.86-3.5v-.05c.48.27 1.04.43 1.63.45a3.57 3.57 0 0 1-1.1-4.77 10.15 10.15 0 0 0 7.36 3.73 3.57 3.57 0 0 1 6.08-3.26 7.12 7.12 0 0 0 2.27-.87 3.58 3.58 0 0 1-1.57 1.97 7.13 7.13 0 0 0 2.05-.56 7.65 7.65 0 0 1-1.78 1.84Z" />
      </svg>
    </a>
    {/* X (formerly Twitter) Icon */}
    <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-black">
        <path d="M17.32 3H21L13.76 12.04 21 21h-3.68l-4.44-5.09L8.47 21H3l7.5-8.64L3 3h4.61l4.4 5.09L17.32 3Z" />
      </svg>
    </a>
    {/* Instagram Icon */}
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-pink-500">
        <path d="M16.98 2H7.02A5.02 5.02 0 0 0 2 7.02v9.96A5.02 5.02 0 0 0 7.02 22h9.96A5.02 5.02 0 0 0 22 16.98V7.02A5.02 5.02 0 0 0 16.98 2ZM20 16.98A3.02 3.02 0 0 1 16.98 20H7.02A3.02 3.02 0 0 1 4 16.98V7.02A3.02 3.02 0 0 1 7.02 4h9.96A3.02 3.02 0 0 1 20 7.02v9.96ZM17 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
      </svg>
    </a>
    {/* WhatsApp Icon */}
    <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-green-500">
        <path d="M12 2A10 10 0 0 0 2 12a9.93 9.93 0 0 0 1.45 5.19L2 22l4.92-1.3A9.93 9.93 0 0 0 12 22a10 10 0 0 0 0-20Zm5.3 14.46c-.22.63-1.26 1.16-1.76 1.23a3.08 3.08 0 0 1-1.45-.1 13.56 13.56 0 0 1-5.48-3.66 5.73 5.73 0 0 1-1.64-3.5 3.2 3.2 0 0 1 .94-2.32 1.13 1.13 0 0 1 .83-.37c.2 0 .4.01.57.02.19.01.44-.07.68.52.26.65.88 2.25.96 2.42.08.17.14.37.03.6-.1.23-.15.37-.3.57-.15.2-.3.44-.43.58-.15.15-.3.32-.13.6.17.27.73 1.21 1.56 1.95 1.07.96 1.97 1.26 2.24 1.4.28.13.45.12.62-.08.17-.2.71-.8.9-1.08.17-.27.37-.23.62-.14.27.1 1.39.66 1.63.78.24.12.41.18.47.27.07.08.07.46-.15 1.1Z" />
      </svg>
    </a>
    {/* Contact Icon */}
    <a href="mailto:your-email@example.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-blue-500">
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-1.4 2L12 11.8 5.4 6h13.2ZM4 18v-9l7.67 6a1 1 0 0 0 1.26 0L20 9v9H4Z" />
      </svg>
    </a>
    <a href="tel:+256909845377" onClick = {()=>{handleCopy()}} className="hover:scale-110  transition-transform flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-800">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.11 19.56 19.56 0 0 1-6-6A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .69 2.81 2 2 0 0 1-.45 2.11L9.03 9.03a16 16 0 0 0 6 6l1.39-1.39a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.69A2 2 0 0 1 22 16.92z" />
</svg>

      <span onClick = {()=>{handleCopy()}} className="text-lg text-gray-600">+256909845377</span>
    </a>
  </div>
</section>

       

      <footer className="bg-blue-600 text-white bg-gradient-to-r from-purple-900 via-blue-500 to-purple-900 py-4 mt-10">
        <div className="container mx-auto px-4 bold text-center">
          <p>&copy; {new Date().getFullYear()} John Doe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Port;
