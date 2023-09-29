import React, { forwardRef } from "react";
import { DragDropContext, Draggable, OnDragEndResponder } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { useTasksDispatch } from "../../context/task/context";
import { AvailableColumns, ProjectData, TaskDetails } from "../../context/task/types";
import Column from "./Column";
import { reorderTasks, updateTask } from "../../context/task/actions";


const DragDropList = (props: {
  data: ProjectData;
}) => {
  const taskDispatch = useTasksDispatch();

  const Container = (props: React.PropsWithChildren) => {
    return <div className="flex">{props.children}</div>;
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const startKey = source.droppableId as AvailableColumns;
    const finishKey = destination.droppableId as AvailableColumns;

    const start = props.data.columns[startKey];
    const finish = props.data.columns[finishKey];

    if (start === finish) {
      const newTaskIDs = Array.from(start.taskIDs);
      newTaskIDs.splice(source.index, 1);
      newTaskIDs.splice(destination.index, 0, draggableId);
      const newColumn = {
        ...start,
        taskIDs: newTaskIDs,
      };
      const newState = {
        ...props.data,
        columns: {
          ...props.data.columns,
          [newColumn.id]: newColumn,
        },
      };
      reorderTasks(taskDispatch, newState);
      return;
    }
    // start and finish list are different

    const startTaskIDs = Array.from(start.taskIDs);
    // Remove the item from `startTaskIDs`
    const updatedItems = startTaskIDs.splice(source.index, 1);

    const newStart = {
      ...start,
      taskIDs: startTaskIDs,
    };

    const finishTaskIDs = Array.from(finish.taskIDs);

    // Insert the item to destination list.
    finishTaskIDs.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIDs: finishTaskIDs,
    };

    // Create new state with newStart and newFinish 
    const newState = {
      ...props.data,
      columns: {
        ...props.data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    reorderTasks(taskDispatch, newState);
  };

return (
  <DragDropContext onDragEnd={onDragEnd}>
    <Container>
      {props.data.columnOrder.map((colID) => {
        const column = props.data.columns[colID];
        const tasks = column.taskIDs.map((taskID) => props.data.tasks[taskID]);
        return <Column key={column.id} column={column} tasks={tasks} />;
      })}
    </Container>
  </DragDropContext>
);
    };
export default DragDropList;
