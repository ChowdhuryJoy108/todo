import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { Helmet } from "react-helmet-async";

const TaskDetails = () => {
  const { id } = useParams(); // Getting the task id from the URL
  const [todo, setTodo] = useState({});
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    axiosPublic
      .get(`/todo/details/${id}`)
      .then((res) => {
        setTodo(res.data);
      })
      .catch((err) => {
        console.error("Error fetching task details:", err);
      });
  }, [id]);

  return (
    <Card className="mx-2 mt-6 max-w-6xl lg:mx-auto">
      <Helmet>
        <title>ToDos|Task Details</title>
      </Helmet>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {todo.title}
        </Typography>
        <Typography>{todo.description}</Typography>
      </CardBody>
      <CardFooter className="flex items-center gap-4 pt-0">
        <Button>{todo?.timestamp || todo?.createdAt}</Button>
      </CardFooter>
    </Card>
  );
};

export default TaskDetails;
