import React from 'react';
import TaskSection from '../../components/TaskSection/TaskSection';
import { NavbarDark } from '../../components/Navbar/NavbarDark';
import { Footer } from '../../components/Footer/Footer';


const Home = () => {
  return (
    <div className='mx-2 mb-16'>
      <NavbarDark />
      <TaskSection />
      <Footer />
    </div>
  );
};

export default Home;