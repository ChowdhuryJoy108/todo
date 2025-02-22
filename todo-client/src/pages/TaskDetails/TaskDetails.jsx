import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import {
    Card,
    CardBody,
    CardFooter,
    Typography,
    Button,
  } from "@material-tailwind/react";

const TaskDetails = () => {
  const [todo, setTodo] = useState({});
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  useEffect(() => {
    axiosPublic.get(`/todos/${id}`).then((res) => {
      setTodo(res.data);
    });
  }, [id]);
  console.log(todo);
  return (
    <Card className="mt-6 max-w-6xl mx-auto">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {todo.title}
        </Typography>
        <Typography>
          {todo.description}
        </Typography>
      </CardBody>
      <CardFooter className="flex items-center gap-4 pt-0">
        <Button>{todo?.timestamp || todo?.createdAt}</Button>
        <Button className="bg-green-300 text-white">Update</Button>
        <Button className="bg-red-400 text-white">Delete</Button>
      </CardFooter>
    </Card>
  );
};

export default TaskDetails;
