var express = require('express')
var User = require('../models/user')
var Project = require('../models/project')
var Task = require('../models/task')
var Comment = require('../models/comment')
var UserTask = require('../models/userTask')

var router = express.Router();

//////////// ADMIN ROUTES  \\\\\\\\\\\\\\\\\\\\\\
router.route('/projects/:count')
    .get((req, res) => {
        if (req.params.count > 0) {
            Project.find().limit(parseInt(req.params.count)).exec((err, projects) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(projects);
                }
            });
        } else {
            Project.find((err, projects) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(projects);
                }
            });
        }

    });


router.route('/project').post((req, res) => {
    var project = new Project(req.body);
    console.log('res.locals.currentUserId:: ', res.locals.currentUserId);
    project.set('createdById', res.locals.currentUserId);
    project.save((err) => {
        if (err) {
            res.send(err);
        } else {
            project.tasks.map((task) => {
                let newTask = new Task(task);
                newTask.set('projectId', project._id);
                newTask.set('createdById', res.locals.currentUserId);
                newTask.save((err, task) => {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    task.assignedToUsersIds.map((userId) => {
                        var userTask = new UserTask({ userId: userId, taskId: task._id });
                        userTask.save((err) => {
                            if (err) {
                                res.send(err);
                                return;
                            }
                        });
                    });
                });
            });

            res.send({ message: 'Project add success' });
        }
    });
});

router.route('/projectdetail/:id').get((req, res) => {
    console.log('requested proj id: ', req.params.id);
    Project.findOne({ _id: req.params.id }, (err, project) => {
        if (err) {
            res.status(404);
            res.send('Project not found!');
        } else if (project == null) {
            res.status(404);
            res.send({ message: 'Project not found!' });
        } else {
            Task.find({ projectId: project._id }, (err, tasks) => {
                if (err) {
                    res.send(err);
                } else {
                    project.set('tasks', tasks);
                    res.send(project);
                }
            });
        }
    });
});

router.route('/project/:id').put((req, res) => {
    let newInfo = req.body;
    Project.findOne({ _id: req.params.id }, (err, project) => {
        if (err || project == null) {
            res.status(404);
            res.send('Project not found!');
        } else {
            console.log('new proj: ', newInfo);
            project.set('name', newInfo.name);
            project.set('description', newInfo.description);
            project.set('lastModefied', Date.now());
            project.set('modefiedById', res.locals.currentUserId);
            project.save((err, project) => {
                if (err) {
                    console.log('err', err);
                    res.send(err);
                } else {
                    console.log('Project update success');
                    res.send({ message: 'Project update success' });
                }
            });
        }
    });
});

router.route('/project/:id').delete((req, res) => {
    Project.remove({ _id: req.params.id }, (err, project) => {
        console.log('project: ', project);
        if (err) {
            res.status(404);
            res.send('Project not found!');
        } else if (project.n == 0) {
            res.status(404);
            res.send({ message: 'Project not found!' });
        } else {
            res.send({ message: 'Project delete success' });
        }
    });
});


//Task

router.route('/tasks/:count')
    .get((req, res) => {
        if (req.params.count > 0) {
            Task.find().limit(parseInt(req.params.count)).exec((err, tasks) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(tasks);
                }
            });
        } else {
            Task.find((err, tasks) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(tasks);
                }
            });
        }

    });

router.route('/task/:id').post((req, res) => {
    Project.findOne({ _id: req.params.id }, (err, project) => {
        if (err) {
            res.send(err);
        } else if (project == null) {
            res.status(404);
            res.send('Project not found!');
        } else {
            var task = new Task(req.body);
            task.set('projectId', project._id);
            task.set('createdById', res.locals.currentUserId);
            task.save((err, task) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log('addedTaskId: ', task._id);
                    task.assignedToUsersIds.map((userId) => {
                        var userTask = new UserTask({ userId: userId, taskId: task._id });
                        console.log('userTaskAdd: ', userTask);
                        userTask.save((err) => {
                            if (err) {
                                res.send(err);
                                return;
                            }
                        });
                    });
                    updateProjectProgress(project._id);
                    res.send({ message: 'Task add success' });
                }
            });
        }
    });

});


router.route('/task/:id').put((req, res) => {
    let newInfo = req.body;
    Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err || task == null) {
            res.status(404);
            res.send('Task not found!');
        } else {
            UserTask.remove({ taskId: task._id }, (err) => {
                if (err) {
                    send(err);
                } else {
                    task.set('title', newInfo.title);
                    task.set('description', newInfo.description);
                    task.set('lastModefied', Date.now);
                    task.set('modefiedById', res.locals.currentUserId);
                    task.assignedToUsersIds
                    task.save((err, task) => {
                        if (err) {
                            res.send(err);
                        } else {
                            task.assignedToUsersIds.map((userId) => {
                                var userTask = new UserTask({ userId: userId, taskId: task._id });
                                console.log('userTaskAdd: ', userTask);
                                userTask.save((err) => {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    }
                                });
                            });
                            res.send({ message: 'Task add success' });
                        }
                    });
                }
            });
        }
    });
});

router.route('/task/:id').delete((req, res) => {
    let projectId = '';
    Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err) {
            res.status(404);
            res.send('Task not found!');
        }
        projectId = task.projectId;

        Task.remove({ _id: req.params.id }, (err, task) => {
            if (err) {
                res.status(404);
                res.send('Task not found!');
            } else if (task.n == 0) {
                res.status(404);
                res.send({ message: 'Task not found!' });
            } else {
                updateProjectProgress(projectId);
                res.send({ message: 'Task delete success' });
            }
        });
    });
});


router.route('/task/users/:id').get((req, res) => {
    let allUsers = [];
    let selectedTaskUsers = [];
    let notSelectedTaskUsers = [];

    User.find((err, users) => {
        if (err) {
            res.send(err);
        } else {
            allUsers.push(users);
            UserTask.find({ taskId: req.params.id }, (err, userTasks) => {
                let userIds = userTasks.map((userTask) => { return userTask.userId; });
                User.find({ _id: { $in: userIds } }, (err, users) => {
                    if (err) {
                        res.send(err);
                    } else {
                        selectedTaskUsers.push(users);
                        var notUserIds = users.map((user) => { return user._id; });
                        User.find({ _id: { $nin: notUserIds } }, (err, notInUsers) => {
                            if (err) {
                                res.send(err);
                            } else {
                                notSelectedTaskUsers.push(notInUsers);
                                res.send({
                                    allUsers: allUsers,
                                    selectedTaskUsers: selectedTaskUsers,
                                    notSelectedTaskUsers: notSelectedTaskUsers
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});



//Comment

//Get {count} Comments 
router.route('/comments/:count')
    .get((req, res) => {
        if (req.params.count > 0) {
            Comment.find().limit(parseInt(req.params.count)).exec((err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log('latest comments: ', comments);
                    res.send(comments);
                }
            });
        } else {
            Comment.find((err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log('latest comments2: ', comments);
                    res.send(comments);
                }
            });
        }

    });



//Get Comments By Task ID
router.route('/comments/task/:id')
    .get((req, res) => {
        if (req.params.count > 0) {
            Comment.find({ taskId: req.params.id }).limit(count).exec((err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(comments);
                }
            });
        } else {
            Comment.find({ taskId: req.params.id }, (err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(comments);
                }
            });
        }

    });



//User

router.get('/enabledusers', (req, res) => {
    User.find({ enabled: true }, (err, users) => {
        if (err) {
            console.log('err', err);
            res.send(err)
        } else {
            res.send(users);
        }
    });
});


router.get('/users', (req, res) => {
    User.find((err, users) => {
        if (err) {
            res.send(err)
        } else {
            users.map((user) => {
                user.set('password', '');
            });
            res.send(users);
        }
    });
});

router.post('/user', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
            res.send(err)
        } else if (user == null) {
            let user = new User(req.body);
            user.save((err) => {
                if (err) {
                    send(err)
                } else {
                    res.send({ message: 'User add success' })
                }
            });
        } else {
            res.send({ message: 'Username already exist!' })
        }
    });
})

router.put('/user', (req, res) => {
    let newInfo = req.body;
    User.findOne({ _id: newInfo.id }, (err, oldUser) => {
        if (err) {
            console.log('err1:', err);
            res.send(err);
        } else if (oldUser == null) {
            console.log('User not found');
            res.status(404);
            res.send({ message: 'User not found!' });
        } else {
            User.findOne({
                username: newInfo.username,
                _id: { "$ne": newInfo.id }
            }, (err, user) => {
                if (err) {
                    console.log('err0:', err);
                    res.send(err)
                } else if (user != null) {
                    console.log('Username already exist');
                    res.send({ message: 'Username already exist!' })
                } else {
                    oldUser.set('username', newInfo.username)
                    oldUser.set('firstname', newInfo.firstname)
                    oldUser.set('lastname', newInfo.lastname)
                    oldUser.set('enabled', newInfo.enabled)
                    oldUser.set('email', newInfo.email)
                    oldUser.set('beautifyRoleName', newInfo.beautifyRoleName)
                    oldUser.save((err, user) => {
                        if (err) {
                            console.log('err:', err);
                            res.send(err)
                        } else {
                            console.log('user update suc');
                            res.send('User update success')
                        }
                    });
                }
            });
        }
    });
})


router.post('/user/resetpwd/:id', (req, res) => {
    console.log('new pwd: ', req.body)
    User.findOne({ _id: req.params.id }, (err, oldUser) => {
        if (err) {
            res.send(err)
        } else if (oldUser == null) {
            res.send({ message: 'User not found!' })
        } else {
            oldUser.set('password', req.body)
            oldUser.save((err, user) => {
                if (err) {
                    res.send(err)
                } else {
                    res.send('My Password update success')
                }
            });
        }
    });
});


router.route('/user/:id').delete((req, res) => {
    User.findOne({ _id: req.params.id }, (err, user) => {
        if (err) {
            res.send(err);
        } else if (user == null) {
            res.status(404);
            res.send('User not found!');
        } else {
            UserTask.remove({ 'userId': user._id }).exec();
            user.remove();
            console.log('updating tasks')
            Task.find({}, (err, tasks) => {
                if (err) {
                    res.send(err)
                } else {
                    tasks.map((task) => {
                        let assignedToUsersIds = task.assignedToUsersIds.filter((userId) => {
                            return userId !== req.params.id;
                        });
                        task.set('assignedToUsersIds', assignedToUsersIds);
                        task.save().exec();
                    });
                    res.send({ message: 'User delete success' });
                }
            })
        }
    })
});



/////////////////// USER ROLE ROUTES \\\\\\\\\\\\\\\\

router.route('/myprojects')
    .get( (req, res) => {
        UserTask.find({ userId: res.locals.currentUserId }).lean().exec( (err, userTasks) => {
            let taskIds = userTasks.map((userTask) => { return userTask.taskId; });
            Task.find({ _id: { $in: taskIds } }).lean().exec( (err, tasks) => {
                let projectIds = tasks.map((task) => { return task.projectId; });
                Project.find({ _id: { $in: projectIds } }, async (err, projects) => {
                    if (err) {
                        res.send(err);
                    } else {

                        let returnedProjectsArray = []; 
                        for (let index = 0; index < projects.length; index++) {
                            let statistics = {
                                'myProgress': 0
                            };
                            let project = projects[index];
                            let projectTasks = await Task.find({ projectId: project._id });
                            let userTaskIds = [];
                            let taskPercent = (100 / projectTasks.length);
                            for (let i = 0; i < projectTasks.length; i++) {
                                userTaskIds.push(projectTasks[i]._id);
                            }
                            let userTaskProgress = 0;
                            let comments = await Comment.find({ createdById: res.locals.currentUserId, taskId: { $in: userTaskIds } });
                            for (let i3 = 0; i3 < comments.length; i3++) {
                                let cm = comments[i3];
                                userTaskProgress += cm.progress
                            }
                            let userProjectProjress = (taskPercent / 100) * userTaskProgress;
                            statistics.myProgress = userProjectProjress;
                            project.set('statistics', statistics);
                        }
                        res.send(projects);
                    }
                });
            });
        });
    });

router.route('/mylatestprojects/:count')
    .get((req, res) => {
        UserTask.find({ userId: res.locals.currentUserId }, (err, userTasks) => {
            let taskIds = userTasks.map((userTask) => { return userTask.taskId; });
            Task.find({ _id: { $in: taskIds } }, (err, tasks) => {
                let projectIds = tasks.map((task) => { return task.projectId; });
                if (req.params.count > 0) {
                    Project.find({ _id: { $in: projectIds } }).limit(parseInt(req.params.count)).exec((err, projects) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(projects);
                        }
                    });
                } else {
                    Project.find({ _id: { $in: projectIds } }, (err, projects) => {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(projects);
                        }
                    });
                }
            });
        });
    });

router.route('/project/:id').get((req, res) => {
    console.log('requested proj id: ', req.params.id);
    Project.findOne({ _id: req.params.id }, (err, project) => {
        if (err) {
            res.status(404);
            res.send('Project not found!');
        } else if (project == null) {
            res.status(404);
            res.send({ message: 'Project not found!' });
        } else {
            res.send(project);
        }
    });
});


router.route('/mylatesttasks/:count')
    .get((req, res) => {
        UserTask.find({ userId: res.locals.currentUserId }, (err, userTasks) => {
            let taskIds = userTasks.map((userTask) => { return userTask.taskId; });
            if (req.params.count > 0) {
                Task.find({ _id: { $in: taskIds } }).limit(parseInt(req.params.count)).exec((err, tasks) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(tasks);
                    }
                });
            } else {
                Task.find({ _id: { $in: taskIds } }, (err, tasks) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(tasks);
                    }
                });
            }
        });
    });


router.route('/tasks/project/:id').get((req, res) => {
    Task.find({ projectId: req.params.id }, (err, tasks) => {
        if (err) {
            res.send(err);
        } else {
            res.send(tasks);
        }
    });
});


router.route('/task/:id').get((req, res) => {
    Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err) {
            res.send(err);
        } else if (task == null) {
            res.send({ message: 'Task not found!' });
        } else {
            res.send(task);
        }
    });
});


router.route('/mytasks/project/:id').get((req, res) => {
    UserTask.find({ userId: res.locals.currentUserId }, (err, userTasks) => {
        if (err) {
            res.send(err);
        } else if (userTasks.length == 0) {
            console.log('userTasks length:: 0');
            res.send([]);
        } else {
            let taskIds = userTasks.map((userTask) => { return userTask.taskId });
            Task.find({ projectId: req.params.id, _id: { $in: taskIds } }, async (err, tasks) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log('tasks::', tasks);
                    
                    for (let index = 0; index < tasks.length; index++) {
                        let statistics = {
                            'myProgress': 0
                        };
                        let task = tasks[index];
                        let userTaskProgress = 0;
                        let comments = await Comment.find({ createdById: res.locals.currentUserId, 
                            taskId: task._id });
                        for (let i3 = 0; i3 < comments.length; i3++) {
                            let cm = comments[i3];
                            userTaskProgress += cm.progress
                        } 
                        statistics.myProgress = userTaskProgress;
                        task.set('statistics', statistics)
                     }
                    
                    res.send(tasks);
                }
            });
        }
    });
});


//Comments

//Get Latest {count} Tasks Which Assigned To Me( loggedin user)
router.route('/mylatestcomments/:count')
    .get((req, res) => {
        if (req.params.count > 0) {
            Comment.find({ createdById: res.locals.currentUserId }).limit(parseInt(req.params.count)).exec((err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(comments);
                }
            });
        } else {
            Comment.find({ createdById: res.locals.currentUserId }, (err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    //console.log('latestComments: ', comments);
                    res.send(comments);
                }
            });
        }

    });


//Add Comment
router.route('/comment/:id').post((req, res) => {
    Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err) {
            res.send(err);
        } else if (task == null) {
            res.status(404);
            res.send('Task not found!');
        } else {
            var comment = new Comment(req.body);
            comment.set('taskId', task._id);
            comment.set('createdById', res.locals.currentUserId);
            comment.set('progress', parseInt(req.body.progress) - task.progress);
            comment.save((err, comment) => {
                if (err) {
                    res.send(err);
                } else {
                    updateTaskProgress(task._id);
                    res.send({ message: 'Comment add success' });
                }
            });
        }
    });

});



//Delete Comment
router.route('/comment/:id').delete((req, res) => {
    let taskId = '';
    Comment.findOne({ _id: req.params.id }, (err, comment) => {
        if (err) {
            res.status(404);
            res.send('Comment not found!');
        }
        taskId = comment.taskId;

        Comment.remove({ _id: req.params.id }, (err, comment) => {
            if (err) {
                res.status(404);
                res.send('Comment not found!');
            } else if (comment.n == 0) {
                res.status(404);
                res.send({ message: 'Comment not found!' });
            } else {
                updateTaskProgress(taskId);
                res.send({ message: 'Comment delete success' });
            }
        });
    });
});

//Get My Comments By Task ID
router.route('/mycomments/task/:id')
    .get((req, res) => {
        if (req.params.count > 0) {
            Comment.find({ taskId: req.params.id, createdById: res.locals.currentUserId }).limit(count).exec((err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(comments);
                }
            });
        } else {
            Comment.find({ taskId: req.params.id, createdById: res.locals.currentUserId }, (err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send(comments);
                }
            });
        }

    });


//User
router.get('/user', (req, res) => {
    User.findOne({ 'username': res.locals.username }).exec((err, user) => {
        if (err) {
            res.send(err)
        } else {
            res.send(user);
        }
    });
})

router.put('/myuser', (req, res) => {
    let newInfo = req.body;
    console.log('profile', newInfo);
    User.findOne({ _id: newInfo.id }, (err, oldUser) => {
        if (err) {
            console.log('err1', err);
            res.send(err)
        } else if (oldUser == null) {
            console.log('profile null');
            res.send({ message: 'User not found!' })
        } else {
            oldUser.set('firstname', newInfo.firstname)
            oldUser.set('lastname', newInfo.lastname)
            oldUser.set('email', newInfo.email)
            oldUser.save((err, user) => {
                if (err) {
                    console.log('err2', err);
                    res.send(err)
                } else {
                    console.log('profile update success');
                    res.send('User update success')
                }
            });
        }
    });
});

router.post('/user/resetmypwd', (req, res) => {
    //newInfo is an array with two items the first is the old password, the second is the new one
    let newInfo = req.body;
    User.findOne({ _id: res.locals.currentUserId }, (err, oldUser) => {
        if (err) {
            res.send(err)
        } else if (oldUser == null) {
            res.send({ message: 'User not found!' })
        } else {
            if (newInfo[0] === oldUser.password) {
                oldUser.set('password', newInfo[1])
                oldUser.save((err, user) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.send('My Password update success')
                    }
                });
            } else {
                res.send({ message: 'Old password incorrect!' })
            }
        }
    });
});


router.get('/myprogress', async (req, res) => {

    let myProgress = [];
    for (let month = 0; month < 12; month++) {

        var dateFrom = new Date(2018, month, 2, 0);
        var dateTo = new Date(2018, month + 1, 1);
        let comments = await Comment.find(
            {
                createdById: res.locals.currentUserId,
                dateCreated: { $gte: dateFrom, $lt: dateTo }
            }
        );
        let sum = 0;
        comments.map((comment) => {
            sum += comment.progress;
        });
        myProgress.push(sum);
    }

    console.log('myprogress:', myProgress);
    res.send(myProgress);
});



router.get('/projectstatistics/:id', (req, res) => {

    Project.findOne(
        { _id: req.params.id }
        , async (err, project) => {
            if (err || project == null) {
                res.status(404);
                res.send('Project not found!');
            } else {
                let statistics = {
                    'inProgressTasks': 0,
                    'completedTasks': 0,
                    'userProgress': {}
                };
                let users = [];
                let userIds = [];
                let taskIds = [];
                let usersProgressArray = [];

                let projectTasks = await Task.find({ projectId: req.params.id });
                let inProgressTasks = await Task.find({ projectId: req.params.id, status: 0 });
                let completedTasks = await Task.find({ projectId: req.params.id, status: 1 });

                for (let i = 0; i < projectTasks.length; i++) {
                    let task = projectTasks[i];
                    let userTasks = await UserTask.find({ taskId: task._id });
                    for (let index = 0; index < userTasks.length; index++) {
                        let userTask = userTasks[index];
                        userIds.push(userTask.userId);
                        taskIds.push(userTask.taskId);
                        users = await User.find({ _id: { $in: userIds } });
                    }
                }

                let taskPercent = (100 / projectTasks.length);

                for (let i2 = 0; i2 < users.length; i2++) {
                    let user = users[i2];
                    let userTaskProgress = 0;
                    let comments = await Comment.find({ createdById: user._id, taskId: { $in: taskIds } });
                    for (let i3 = 0; i3 < comments.length; i3++) {
                        let cm = comments[i3];
                        userTaskProgress += cm.progress
                    }
                    let userProjectProjress = (taskPercent / 100) * userTaskProgress;
                    usersProgressArray.push(
                        {
                            'username': user.username,
                            'progress': userProjectProjress
                        }
                    );
                }
                statistics.inProgressTasks = inProgressTasks.length;
                statistics.completedTasks = completedTasks.length;
                statistics.userProgress = usersProgressArray;
                project.set('statistics', statistics);
                res.send(project);
            }
        });
});

function updateProjectProgress(projectId) {
    Project.findOne({ _id: projectId }, async (err, project) => {
        let projectTasks = await Task.find({ projectId: projectId });
        let taskCount = projectTasks.length;
        let tasksProgressSum;

        for (let index = 0; index < projectTasks.length; index++) {
            tasksProgressSum += projectTasks[index].progress;
        }
        project.set('progress', tasksProgressSum / tasksCount);
        project.save();
    });
}

function updateTaskProgress(taskId) {
    Task.findOne({ _id: taskId }, async (err, task) => {

        let taskComments = await Comment.find({ taskId: taskId });
        let tasksProgressSum =  0;

        for (let index = 0; index < taskComments.length; index++) {
            tasksProgressSum += taskComments[index].progress;
        }
        task.set('progress', tasksProgressSum);
        if (task.progress == 100) {
            task.set('status', 1);
        } else {
            task.set('status', 0);
        }
        task.save((err, task) => {
            updateProjectProgress(task.projectId);
        });
    });
}

module.exports = router;