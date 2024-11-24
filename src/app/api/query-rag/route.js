import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, classId } = req.body;

  try {
    const { stdout, stderr } = await execAsync(
      `python main.py query "${query}" ${classId}`
    );

    if (stderr) {
      console.error('Error:', stderr);
      return res.status(500).json({ error: stderr });
    }

    const response = JSON.parse(stdout);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}