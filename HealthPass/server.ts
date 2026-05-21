import app from './src/app';
import { config } from './src/config';

// ── Start Server ──
app.listen(config.port, () => {
  console.log(`🚀 HealthPass API running on http://localhost:${config.port}`);
  console.log(`   Env: ${config.nodeEnv}`);
});
