import { useState, type ChangeEvent, type FormEvent } from 'react';

type taskType = {
  id: number;
  task: string;
  isCompleted: boolean;
};
const test = () => {
  const [task, setTask] = useState('');
  const [tasks, setAllTasks] = useState<taskType[]>([]);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(task);
    const newTask = { id: Date.now(), task: task, isCompleted: false };
    setAllTasks((pre) => [...pre, newTask]);
  };
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTask(e.target.value);
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="task" value={task} onChange={handleChange} />
        <button type="submit">add</button>
      </form>
      {tasks.map((task) => (
        <li>{task.task}</li>
      ))}
    </div>
  );
};

export default test;
