import { EventHandler } from './moduls/eventHandler'
import { UI } from './moduls/ui'
import { Validations } from './moduls/validations'
import { Storage } from './moduls/storage'

import './styles.css'

export const eventHandler = new EventHandler()
export const ui = new UI()
export const validations = new Validations()

export const storage = new Storage()
