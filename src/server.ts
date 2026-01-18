import bootstrap from "./app";

const PORT = 3000;

bootstrap().then((app) => {
  app.listen(PORT, () => {
    console.log(`🚀 Ticket Service running on port ${PORT}`);
  });
});
