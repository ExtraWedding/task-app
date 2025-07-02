import Task from "../models/taskModel.js"

// CREATE A NEW TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed  } = req.body;
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: completed === 'Yes' || completed === true,
      owner: req.user.id
    });
    const savedTask = await task.save();
    res.status(201).json({ success: true, task: savedTask});
  } catch (error) {
    res.status(400).json({ success:false, message: error.message });
  }
};


// GET ALL TASK FOR LOGGED - IN USER 
export const getTasks = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// GET SINGLE TASK BY ID (MUST BELONG TO THAT USER)
export const getTaskById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.owner = req.user.id;
    }
    const task = await Task.findOne(filter);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE A TASK
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completed !== undefined) {
      data.completed = data.completed === 'Yes' || data.completed === true;
    }

    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.owner = req.user.id;
    }

    const updated = await Task.findOneAndUpdate(
      filter,
      data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.status(200).json({ success: true, task: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE A TASK
export const deleteTask = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.owner = req.user.id;
    }
    const deleted = await Task.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

