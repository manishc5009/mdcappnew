import express from 'express';
import axios from 'axios';
import process from 'process';

const router = express.Router();

import { Notebook } from '../db/index.js';

// New endpoint to register notebook with inputs
router.post('/register-notebook', async (req, res) => {
  try {
    const notebookData = req.body;
    console.log('Register notebook data received:', notebookData);

    // Extract fields
    const { taskId, fileName, selectedOption, selectedDataId, currentStep, uploadCompleted, email, username, id } = notebookData;
    console.log('Extracted fields:', { taskId, fileName, selectedOption, selectedDataId, currentStep, uploadCompleted, email, username, id });

    // Validate required fields
    const missingFields = [];
    if (!taskId) missingFields.push('taskId');
    if (!fileName) missingFields.push('fileName');
    if (!selectedOption) missingFields.push('selectedOption');
    if (!selectedDataId) missingFields.push('selectedDataId');
    if (currentStep === undefined) missingFields.push('currentStep');
    if (uploadCompleted === undefined) missingFields.push('uploadCompleted');
    if (!id) missingFields.push('id');
    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Missing required fields in request body', missingFields });
    }

    // Save to database
    const newNotebook = await Notebook.create({
      taskId,
      fileName,
      selectedOption,
      selectedDataId,
      currentStep,
      uploadCompleted,
      userId: id,
      username: username,
      email: email
    });

    res.status(200).json({ message: 'Notebook registered and saved successfully', data: newNotebook });
  } catch (error) {
    console.error('Error registering notebook:', error);
    res.status(500).json({ error: 'Failed to register notebook' });
  }
});


// Helper function to list notebooks
async function listNotebooks(folderPath) {
  try {
    const response = await axios.get(
      `${process.env.DATABRICKS_INSTANCE}/api/2.0/workspace/list`,
      {
        params: { path: folderPath },
        headers: {
          Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
        },
      }
    );
    console.log("List notebooks API response data:", response.data);

    if (!response.data || !Array.isArray(response.data.objects)) {
      throw new Error("No objects found in the response or invalid response format.");
    }

    const notebooks = response.data.objects.filter(obj => obj.object_type === "NOTEBOOK");
    return notebooks;
  } catch (error) {
    console.error("Error in listNotebooks:", error);
    throw new Error("Failed to list notebooks.");
  }
}

// Endpoint to trigger notebook execution
router.post("/run-notebook", async (req, res) => {
  try {
    const { source } = req.body;
    const databricksToken = process.env.DATABRICKS_TOKEN;
    const databricksInstance = process.env.DATABRICKS_INSTANCE;
    const notebookFolderPath = process.env.NOTEBOOK_PATH;
    console.log("Databricks Token:", source);

    if (!source || !databricksToken || !databricksInstance || !notebookFolderPath) {
      return res.status(400).json({ error: "Missing required parameters or environment variables" });
    }

    const notebooks = await listNotebooks(notebookFolderPath);
    console.log("Notebooks found:", notebooks);
    const matchingNotebook = notebooks.find(nb =>
      nb.path.toLowerCase().includes(source.toLowerCase())
    );

    if (!matchingNotebook) {
      return res.status(400).json({ error: `No notebook found matching source: ${source}` });
    }

    const response = await axios.post(
      `${databricksInstance}/api/2.1/jobs/runs/submit`,
      {
        run_name: "Triggered from MDC App",
        existing_cluster_id: process.env.DATABRICKS_CLUSTER_ID,
        notebook_task: {
          notebook_path: matchingNotebook.path,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${databricksToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: `Notebook execution triggered successfully.`,
      run_id: response.data.run_id,
      notebook_name: matchingNotebook.path,
      notebooks,
    });
  } catch (error) {
    console.error("Error triggering notebook:", error);
    let errorMessage = "Failed to trigger notebook";
    if (error.response && error.response.data) {
      errorMessage = JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Endpoint to list notebooks
router.get("/list-notebooks", async (req, res) => {
  try {
    const notebookPath = process.env.NOTEBOOK_PATH;
    const notebooks = await listNotebooks(notebookPath);
    res.json({
      message: `Notebooks in folder ${notebookPath}:`,
      notebooks,
    });
  } catch (error) {
    console.error("Error listing notebooks:", error);
    res.status(500).json({ error: "Failed to list notebooks" });
  }
});

// Endpoint to check run status
router.get("/run-status/:runId", async (req, res) => {
  try {
    const runId = req.params.runId;
    const databricksToken = process.env.DATABRICKS_TOKEN;
    const databricksInstance = process.env.DATABRICKS_INSTANCE;

    if (!runId || !databricksToken || !databricksInstance) {
      return res.status(500).json({ error: "Missing required parameters or environment variables" });
    }

    const response = await axios.get(
      `${databricksInstance}/api/2.1/jobs/runs/get`,
      {
        params: { run_id: runId },
        headers: { Authorization: `Bearer ${databricksToken}` },
      }
    );

    const progressMap = {
      PENDING: 10,
      QUEUED: 20,
      RUNNING: 60,
      TERMINATING: 90,
      TERMINATED: 100,
    };

    const lifeCycle = response.data.state.life_cycle_state;
    const result_state = response.data.state.result_state || 'N/A';
    const state_message = response.data.state.state_message || '';

    res.json({
      message: `Status for run_id ${runId}:`,
      runStatus: response.data.state,
      status: lifeCycle === 'TERMINATED' ? 'completed'
            : lifeCycle === 'INTERNAL_ERROR' ? 'error'
            : lifeCycle.toLowerCase(),
      state_message: state_message,
      result: result_state,
      progress: progressMap[lifeCycle] || 0,
    });

  } catch (error) {
    console.error("Error fetching run status:", error);
    res.status(500).json({ error: "Failed to fetch run status" });
  }
});

// Health check endpoint
router.get("/", (req, res) => {
  res.send("Hello testing");
});

export default router;