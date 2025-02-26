import React, { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { IoMdAdd } from "react-icons/io";
import { Helmet } from "react-helmet-async";
import { MdRemoveRedEye } from "react-icons/md";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
} from "@material-tailwind/react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "../SortableItem";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const TaskSection = () => {
  const [todos, setTodos] = useState([]);
  const [activeTab, setActiveTab] = useState("To-Do");
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  console.log(user);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    category: "To-Do",
  });

  useEffect(() => {
    const fetchTodos = () => {
      axiosPublic
        .get(`/todos/${user?.email}`)
        .then((res) => {
          setTodos(res.data);
          if (res.data.length > 0) {
            setActiveTab(res.data[0].category);
          }
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${err}`,
          });
        });
    };

    fetchTodos();
    const interval = setInterval(fetchTodos, 5000);

    return () => clearInterval(interval);
  }, [user?.email]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const draggedTask = todos.find((todo) => todo._id === activeId);
    const overTask = todos.find((todo) => todo._id === overId);
    const newCategory = overTask ? overTask.category : overId;

    if (!draggedTask || !newCategory) return;

    if (draggedTask.category !== newCategory) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === activeId ? { ...todo, category: newCategory } : todo
        )
      );

      axiosPublic
        .put(`/todos/${draggedTask._id}`, { category: newCategory })
        .catch((err) => console.error("Error updating category:", err));
    } else {
      const oldIndex = todos.findIndex((todo) => todo._id === activeId);
      const newIndex = todos.findIndex((todo) => todo._id === overId);
      const updatedTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(updatedTodos);
    }
  };

  const uniqueCategories = ["To-Do", "In Progress", "Done"];

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setTaskData({ title: "", description: "", category: "To-Do" });
  };

  const handleOpenUpdateModal = (task) => {
    console.log(task);
    setOpenUpdateModal(true);
    setSelectedTask(task);
    setTaskData({
      title: task.title,
      description: task.description,
      category: task.category,
    });
  };

  const handleCloseModals = () => {
    setOpenAddModal(false);
    setOpenUpdateModal(false);
    setSelectedTask(null);
    setTaskData({ title: "", description: "", category: "To-Do" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleAddTask = () => {
    const taskWithUserEmail = { ...taskData, email: user?.email };

    axiosPublic
      .post("/todos", taskWithUserEmail)
      .then((response) => {
        setTodos((prevTodos) => [...prevTodos, response.data]);
        handleCloseModals();
        Swal.fire({
          icon: "success",
          title: "Task Added Successfully!",
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Failed-${err}`,
        });
      });
  };

  const handleUpdateTask = () => {
    console.log(selectedTask);
    if (!selectedTask) return;

    axiosPublic
      .put(`/todo-update/${selectedTask._id}`, taskData)
      .then(() => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === selectedTask._id ? { ...todo, ...taskData } : todo
          )
        );
        handleCloseModals();
        Swal.fire({
          icon: "success",
          title: "Task Updated Successfully!",
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Failed-${err}`,
        });
      });
  };

  const handleDelete = (id) => {
    axiosPublic
      .delete(`/todos/${id}`)
      .then(() => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
        Swal.fire({
          icon: "success",
          title: "Task Deleted Successfully!",
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Failed-${err}`,
        });
      });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet>
        <title>ToDos || Home</title>
      </Helmet>
      <div className="my-6">
        <Button
          className="inline-flex items-center gap-2"
          onClick={handleOpenAddModal}
        >
          <IoMdAdd className="text-2xl text-white lg:text-4xl" /> Add ToDos
        </Button>
      </div>

      <Dialog open={openAddModal} handler={handleCloseModals}>
        <DialogHeader>Add New Task</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Task Title"
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
            />
            <Textarea
              label="Description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
            />
            <select
              name="category"
              value={taskData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center gap-4">
          <Button className="btn-primary" onClick={handleAddTask}>
            Add Task
          </Button>
          <Button color="red" onClick={handleCloseModals}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openUpdateModal} handler={handleCloseModals}>
        <DialogHeader>Update Task</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Task Title"
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
            />
            <Textarea
              label="Description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
            />
            <select
              name="category"
              value={taskData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center gap-4">
          <Button className="btn-primary" onClick={handleUpdateTask}>
            Update Task
          </Button>
          <Button color="red" onClick={handleCloseModals}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
        <TabsHeader>
          {uniqueCategories.map((category) => (
            <Tab key={category} value={category}>
              <h1 className="text-xs font-bold lg:text-lg">{category}</h1>
            </Tab>
          ))}
        </TabsHeader>
        <TabsBody>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {uniqueCategories.map((category) => (
              <TabPanel
                className="bg-gray-100 p-4 rounded-md mb-4"
                key={category}
                value={category}
              >
                <SortableContext
                  items={todos.filter((todo) => todo.category === category)}
                  strategy={verticalListSortingStrategy}
                >
                  {todos
                    .filter((todo) => todo.category === category)
                    .map((task) => (
                      <div
                        key={task._id}
                        id={task._id}
                        className="flex flex-col gap-6 items-center justify-between bg-white p-4 mb-4 rounded-lg shadow-md lg:flex-row"
                      >
                        <SortableItem id={task._id}>
                          <div className="w-full p-4 bg-amber-50 rounded-lg lg:w-[500px]">
                            <h1 className="text-xs font-bold lg:text-lg">
                              {task.title}
                            </h1>
                          </div>
                        </SortableItem>
                        <div className="inline-flex items-center gap-2">
                          <Link to={`/todo/details/${task._id}`}>
                            <MdRemoveRedEye className="bg-purple-300 rounded-full" />
                          </Link>
                          <Button
                            onClick={() => handleOpenUpdateModal(task)}
                            className="bg-green-300 text-white"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={() => handleDelete(task._id)}
                            className="bg-red-400 text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </SortableContext>
              </TabPanel>
            ))}
          </DndContext>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default TaskSection;
