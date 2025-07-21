import { EventHandler } from './moduls/eventHandler'
import { UI } from './moduls/ui'
import { Helpers } from './moduls/helpers'
import { ApiServices } from './moduls/apiServices'
import './styles.css'

export const eventHandler = new EventHandler()
export const ui = new UI()
export const helpers = new Helpers()
export const apiServices = new ApiServices()
