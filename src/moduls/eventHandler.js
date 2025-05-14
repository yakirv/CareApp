import { ui } from '..'
import { validations } from '..'

export class EventHandler
{
  
    addFood
    addSleep
    newTaskName
    newTaskDesc
    newTaskButton

    constructor()
    {
        document.addEventListener('DOMContentLoaded', () => {
            this.addFood = document.getElementById('add-food-action');
            this.addSleep = document.getElementById('add-sleep-action');
            this.newTaskButton = document.getElementById('submit-new-task')
            this.clickAddFood()
            this.clickAddSleep()
            this.clickNewTask()
            validations.blur_inputValidate('task-name')
            validations.focus_inputValidate('task-name')
            validations.blur_inputValidate('task-description')
            validations.focus_inputValidate('task-description')
        })

    }
    clickNewTask(){
        this.newTaskButton.addEventListener('click',(event)=>{
        const newTaskForm = document.getElementById('new-task-form')
            event.preventDefault();

            const formData = new FormData(newTaskForm);
            const taskName = formData.get('new-task-name')
            const taskDesc = formData.get('new-task-description')
            const validateName = validations.inputValidation('task-name')
            const validateDesc = validations.inputValidation('task-description')
            
            if (validateName.isvalid && validateDesc.isvalid)
            {
                ui.newWorkItem(taskName, taskDesc)
                newTaskForm.reset();
            }
        
        })
    }
    clickAddFood()
    {
        this.addFood.addEventListener('click', ()=>{
            ui.newWorkItem('נוטרילון', '200 מ״ל')
        })
    }
    clickAddSleep()
    {
        this.addSleep.addEventListener('click', ()=>{
            ui.newWorkItem('שינה', 'שעתיים')
        })
    }
   
}

