import Notebook from '../models/notebook.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js'; // fixed import path
dayjs.extend(relativeTime);

export const getMetrics = async (req, res) => {
  try {
    const totalUploads = await Notebook.count();
    const successfulUploads = await Notebook.count({ where: { status: 1 } }); // assuming status 1 means success
    const failedUploads = await Notebook.count({ where: { status: 0 } }); // assuming status 0 means failure
    const dataProcessedResult = await Notebook.findAll({
      attributes: [
        [Notebook.sequelize.fn('SUM', Notebook.sequelize.col('total_rows')), 'totalRowsProcessed']
      ],
      raw: true
    });
    const dataProcessed = dataProcessedResult[0].totalRowsProcessed || 0;

    const recentUploadsRaw = await Notebook.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['fileName', 'filesize', 'createdAt'],
      raw: true
    });

    const recentUploads = recentUploadsRaw.map(upload => ({
      fileName: upload.fileName,
      filesize: upload.filesize,
      timeAgo: dayjs(upload.createdAt).fromNow()
    }));

    res.json({
      totalUploads,
      successfulUploads,
      failedUploads,
      dataProcessed,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
