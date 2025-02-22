import React, { useEffect, useState, useCallback } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
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
import io from "socket.io-client";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});

socket.on("connect_error", (err) => {
  console.error("WebSocket connection error:", err);
});

const TaskSection = () => {
  const [todos, setTodos] = useState([]);
  const [activeTab, setActiveTab] = useState("To-Do");
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "To-Do",
  });

  useEffect(() => {
    axiosPublic
      .get("/todos")
      .then((res) => {
        setTodos(res.data);
        if (res.data.length > 0) {
          setActiveTab(res.data[0].category);
        }
      })
      .catch((err) => console.error("Error fetching todos:", err));

    socket.on("taskUpdated", (updatedTask) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === updatedTask.id
            ? { ...todo, category: updatedTask.category }
            : todo
        )
      );
    });

    return () => {
      socket.off("taskUpdated");
    };
  }, [axiosPublic]);

  useEffect(() => {
    socket.on("taskDeleted", (deletedTask) => {
      console.log("Received taskDeleted event from server:", deletedTask);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== deletedTask.id));
    });

    return () => {
      socket.off("taskDeleted");
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const draggedTask = todos.find((todo) => todo._id === activeId);
    const overTask = todos.find((todo) => todo._id === overId);
    const newCategory = overTask ? overTask.category : overId;

    if (!draggedTask || !newCategory) return;

    if (draggedTask.category !== newCategory) {
      const updatedTodos = todos.map((todo) =>
        todo._id === activeId ? { ...todo, category: newCategory } : todo
      );
      setTodos(updatedTodos);

      axiosPublic
        .put(`/todos/${draggedTask._id}`, { category: newCategory })
        .then(() => {
          socket.emit("taskUpdated", {
            id: draggedTask._id,
            category: newCategory,
          });
        })
        .catch((err) => console.error("Error updating category:", err));
    } else {
      const oldIndex = todos.findIndex((todo) => todo._id === activeId);
      const newIndex = todos.findIndex((todo) => todo._id === overId);
      const updatedTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(updatedTodos);
    }
  }, [todos, axiosPublic]);

  const uniqueCategories = ["To-Do", "In Progress", "Done"];

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewTask({ title: "", description: "", category: "To-Do" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleAddTask = () => {
    const taskWithUserEmail = { ...newTask, timestamp: new Date().toISOString(), email: user?.email };

    axiosPublic
      .post("/todos", taskWithUserEmail)
      .then((response) => {
        socket.emit("taskAdded", response.data);
        setTodos((prevTodos) => [...prevTodos, response.data]);
        handleCloseModal();
      })
      .catch((err) => console.error("Error adding task:", err));
  };

  const handleDeleteTask = (taskId) => {
    console.log("Deleting task with ID:", taskId); // Debugging

    // Optimistically update the UI
    const taskToDelete = todos.find((todo) => todo._id === taskId);
    console.log("Task to delete:", taskToDelete); // Debugging

    setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== taskId));

    // Send delete request to the backend
    axiosPublic
      .delete(`/todos/${taskId}`)
      .then((response) => {
        if (response.data.success) {
          console.log("Task deleted successfully");
        } else {
          // If deletion fails, revert the UI change
          setTodos((prevTodos) => [...prevTodos, taskToDelete]);
          console.error("Failed to delete task:", response.data.message);
        }
      })
      .catch((err) => {
        // Revert the UI change if the request fails
        setTodos((prevTodos) => [...prevTodos, taskToDelete]);
        console.error("Error deleting task:", err);
      });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="my-6">
        <Button className="inline-flex items-center gap-2" onClick={handleOpenModal}>
          <IoMdAdd className="text-white text-4xl" /> Add ToDos
        </Button>
      </div>

      <Dialog open={openModal} handler={handleCloseModal}>
        <DialogHeader>Add New Task</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Task Title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
            />
            <Textarea
              label="Description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
            />
            <select
              name="category"
              value={newTask.category}
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
          <Button className="btn-primary" onClick={handleAddTask}>Add Task</Button>
          <Button color="red" onClick={handleCloseModal}>Cancel</Button>
        </DialogFooter>
      </Dialog>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
        <TabsHeader>
          {uniqueCategories.map((category) => (
            <Tab key={category} value={category}>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{category}</h1>
              </div>
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
                <div className="min-h-[200px] p-4 bg-gray-200 rounded-md">
                  <SortableContext
                    items={todos.filter((todo) => todo.category === category)}
                    strategy={verticalListSortingStrategy}
                  >
                    {todos
                      .filter((todo) => todo.category === category)
                      .map(({ _id, title }) => (
                        <SortableItem key={_id} id={_id}>
                          <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-lg shadow-md">
                            <Link to={`/todos/${_id}`}>
                              <h1 className="font-bold text-lg">{title}</h1>
                            </Link>
                            <div className="flex items-center gap-4">
                              <Button
                                onClick={() => editTask({ _id, title })}
                                className="bg-green-600"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                onClick={() => handleDeleteTask(_id)}
                                className="bg-red-600"
                              >
                                <MdDelete />
                              </Button>
                            </div>
                          </div>
                        </SortableItem>
                      ))}
                  </SortableContext>
                </div>
              </TabPanel>
            ))}
          </DndContext>
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default TaskSection;