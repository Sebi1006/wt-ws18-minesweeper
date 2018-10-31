package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.minesweeper.MineSweeper

@Singleton
class MineSweeperController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  val gameController = MineSweeper.controller

  def minesweeperAsText = "hi"

  def about = Action {
    Ok(views.html.index())
  }

  def minesweeper = Action {
    Ok(minesweeperAsText)
  }

}
