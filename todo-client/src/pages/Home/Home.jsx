import React from 'react';
import TaskSection from '../../components/TaskSection/TaskSection';

const Home = () => {
  return (
    <div className='mb-16'>
      <div className='my-16'>
        <h1 className='text-4xl font-bold text-center'>Task Manager</h1>
      </div>
      <TaskSection />
    </div>
  );
};

export default Home;