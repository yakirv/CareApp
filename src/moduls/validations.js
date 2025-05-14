export class Validations {
    inputValidation = (element) => {
        // const elementId= element.id
        const input = document.getElementById(element)
        const validityState = input.validity

        if (validityState.valueMissing) {
            input.setCustomValidity('')
        } else if (validityState.rangeUnderflow) {
            input.setCustomValidity('We need a higher number!')
        } else if (validityState.rangeOverflow) {
            input.setCustomValidity("That's too high!")
        } else {
            input.setCustomValidity('')
        }

        const isvalid = input.validity.valid
        const errorReason = input.validityState

        if (!isvalid) {
            input.style.border = '2px solid #dc3737a2'
        }

        return { isvalid, errorReason }
    }
    /*     submitButtonValidation = ()=>
      {
        const projectNameField= document.getElementById('new-project-name');
                    const validation = this.inputValidation(projectNameField);
                    if (!validation.isvalid)
                    {
                        projectNameField.style.border= '2px solid #dc3737a2'; 
                        return false;
                    }
                    else{
                        return true;
                    }
      } */

    blur_inputValidate = (inputElement) => {
        const input = document.getElementById(inputElement)

        input.addEventListener('blur', () => {
            let isvalid = this.inputValidation(inputElement)
            if (!isvalid.isvalid) {
                console.log('Field is empty')
                input.style.border = '2px solid #dc3737a2'
            } else {
                input.style.border = 'none'
            }
        })
    }
    focus_inputValidate = (inputElement) => {
        // const isvalid =  this.inputValidation(elem);

        const input = document.getElementById(inputElement)

        input.addEventListener('focus', function (event) {
            event.preventDefault()
            console.log('Input Is Focused!')

            input.style.border = 'none'
        })
    }
}
