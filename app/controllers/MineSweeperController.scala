package controllers

import de.htwg.se.minesweeper.MineSweeper
import de.htwg.se.minesweeper.controller.ControllerInterface

import javax.inject._
import play.api.mvc._

@Singleton
class MineSweeperController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  val gameController: ControllerInterface = MineSweeper.controller

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

  def resizeGrid(height: Int, width: Int, numMines: Int) = Action {
    gameController.createGrid(height, width, numMines)
    Ok(views.html.minesweeper(gameController))
  }

  def solve = Action {
    gameController.solve()
    Ok(views.html.minesweeper(gameController))
  }

  def setChecked(row: Int, col: Int) = Action {
    gameController.setChecked(row, col, false, true, false)
    Ok(views.html.minesweeper(gameController))
  }

}
