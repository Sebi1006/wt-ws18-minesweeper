package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.minesweeper.MineSweeper

@Singleton
class MineSweeperController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  val gameController = MineSweeper.controller

  def about = Action {
    Ok(views.html.index())
  }

  def minesweeper = Action {
    Ok(views.html.minesweeper(gameController))
  }

  def newGrid = Action {
    gameController.createGrid(10, 10, 10)
    Ok(views.html.minesweeper(gameController))
  }

}
