import { ApolloServer } from 'apollo-server';
import { readFileSync } from 'fs';

const typeDefs = readFileSync('./typeDefs.gql', 'UTF-8')

interface Task {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface AddTaskInput {
  name: string;
  description?: string;
}

interface AddTagInput {
  taskId: number;
  name: string;
}

const tasks: Task[] = [];
let _taskId = 0;
const tags: Tag[] = [];
let _tagId = 0;
const betweenTaskAndTagList: { taskId: number; tagId: number; }[] = []

const resolvers = {
  Query: {
    getAllTasks: () => tasks,
    getTaskById: (parent: any, args: Task) =>
      tasks.find(task => task.id === Number(args.id)),
    getAllTags: () => tags,
    getTagById: (parent: any, args: Tag) =>
      tags.find(tag => tag.id === Number(args.id))
  },
  Mutation: {
    addTask(parent: any, args: { input: AddTaskInput }): Task {
      const newTask: Task = {
        id: ++_taskId,
        ...args.input
      };
      tasks.push(newTask);

      return newTask;
    },
    addTag(parent: any, args: { input: AddTagInput }): Tag {
      if (!tasks.some(task => task.id === Number(args.input.taskId))) {
        throw new Error("そのIDのタスクは存在しません。");
      }

      const newTag: Tag = {
        id: ++_tagId,
        ...args.input
      };
      tags.push(newTag);

      betweenTaskAndTagList.push({
        taskId: Number(args.input.taskId),
        tagId: _tagId
      });

      return newTag;
    }
  },
  Task: {
    tags: (parent: Task) =>
      betweenTaskAndTagList
        .filter(betweenTaskAndTag => betweenTaskAndTag.taskId === parent.id)
        .map(betweenTaskAndTag => betweenTaskAndTag.tagId)
        .map(tagId => tags.find(tag => tag.id === tagId))
  },
  Tag: {
    tasks: (parent: Tag) =>
      betweenTaskAndTagList
        .filter(betweenTaskAndTag => betweenTaskAndTag.tagId === parent.id)
        .map(betweenTaskAndTag => betweenTaskAndTag.taskId)
        .map(taskId => tasks.find(task => task.id === taskId))
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen()
