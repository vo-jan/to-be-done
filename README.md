# To-Be-Done

![preview](https://github.com/user-attachments/assets/84bdfc88-7ac3-4358-8cfd-d682fcb0958a)

**To-Be-Done** is a simple web application designed to help users track everyday tasks. Built with Node.js, it allows users to:

* Define due dates and times for tasks
* Add short comments
* Edit existing tasks
* Mark tasks as completed or uncompleted
* Maintain a deletable history of completed tasks

## Warning

Right now this is a proof of concept. In the current state the "tasks" are stored in an array on backend, there is no authorization nor database configured so tasks are shared between all users accessing the website, feel free to modify it to work the way you like.

## Project Structure

* `backend/` – Node.js backend intended for deployment as an Azure Web App Service
* `frontend/` – Frontend designed to be deployed as an Azure Static Web App

## Deployment

To deploy the application:

1. **Backend**: Deploy the `backend/` directory to Azure as a Web App Service.
2. **Frontend**: Deploy the `frontend/` directory to Azure as a Static Web App.

Ensure that both services are correctly configured to communicate with each other.

## License

This project is open-source and available under the [MIT License](LICENSE).
