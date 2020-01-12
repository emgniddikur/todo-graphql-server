const { ApolloServer } = require('apollo-server')
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.gql', 'UTF-8')

const tasks = [];
let _taskId = 0;
const tags = [];
let _tagId = 0;
const betweenTaskAndTagList = []

const resolvers = {
  Query: {
    getAllTasks: () => tasks,
    getTaskById: (parent, args) => tasks.find(task => task.id === Number(args.id)),
    getAllTags: () => tags,
    getTagById: (parent, args) => tags.find(tag => tag.id === Number(args.id))
  },
  Mutation: {
    addTask(parent, args) {
      const newTask = {
        id: ++_taskId,
        ...args.input
      };
      tasks.push(newTask);

      return newTask;
    },
    addTag(parent, args) {
      if (!tasks.some(task => task.id === Number(args.input.taskId))) {
        throw new Error("そのIDのタスクは存在しません。");
      }

      const newTag = {
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
    tags: parent =>
      betweenTaskAndTagList
        .filter(betweenTaskAndTag => betweenTaskAndTag.taskId === parent.id)
        .map(betweenTaskAndTag => betweenTaskAndTag.tagId)
        .map(tagId => tags.find(tag => tag.id === tagId))
  },
  Tag: {
    tasks: parent =>
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
