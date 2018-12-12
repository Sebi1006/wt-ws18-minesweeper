package controllers

import de.htwg.se.minesweeper.MineSweeper
import de.htwg.se.minesweeper.controller.ControllerInterface
import de.htwg.se.minesweeper.controller.{CellChanged, GridSizeChanged, Winner}

import javax.inject._
import play.api.mvc._
import play.api.libs.streams.ActorFlow

import akka.actor._
import akka.stream.Materializer

import scala.swing.Reactor

@Singleton
class MineSweeperController @Inject()(cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {

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

  def setFlag(row: Int, col: Int) = Action {
    gameController.setFlag(row, col, false, true)
    Ok(views.html.minesweeper(gameController))
  }

  def unsetFlag(row: Int, col: Int) = Action {
    gameController.setFlag(row, col, true, true)
    Ok(views.html.minesweeper(gameController))
  }

  def gridToJson = Action {
    Ok(gameController.toJson())
  }

  def socket: WebSocket = WebSocket.accept[String, String] { _ =>
    ActorFlow.actorRef { out =>
      println("Connection received")
      MineSweeperWebSocketActorFactory.create(out)
    }
  }

  object MineSweeperWebSocketActorFactory {
    def create(out: ActorRef): Props = {
      Props(new MineSweeperWebSocketActor(out))
    }
  }

  class MineSweeperWebSocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo(gameController)

    def receive: PartialFunction[Any, Unit] = {
      case message: String =>
        out ! gameController.toJson().toString
        println("Sent JSON to Client" + message)
    }

    reactions += {
      case event: GridSizeChanged => sendJsonToClient
      case event: CellChanged => sendJsonToClient
      case event: Winner => sendJsonToClient
    }

    def sendJsonToClient: Unit = {
      println("Received event from Controller")
      out ! gameController.toJson().toString
    }
  }

  def polymer = Action {
    Ok(views.html.polymer())
  }

}
