import app from './app';
import { PORT } from './config';

const port = Number(process.env.PORT || PORT || 4000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
