package controllers

import de.htwg.se.minesweeper.MineSweeper
import de.htwg.se.minesweeper.controller.ControllerInterface
import de.htwg.se.minesweeper.controller.{CellChanged, GridSizeChanged, Winner}

import javax.inject._
import play.api.mvc._
import play.api.libs.streams.ActorFlow
import play.api.i18n.I18nSupport

import akka.actor._
import akka.stream.Materializer

import scala.swing.Reactor
import scala.concurrent.Future

import com.mohiva.play.silhouette.api.Silhouette
import com.mohiva.play.silhouette.api.actions.SecuredRequest
import org.webjars.play.WebJarsUtil
import utils.auth.DefaultEnv

@Singleton
class MineSweeperController @Inject()(components: ControllerComponents,
                                      silhouette: Silhouette[DefaultEnv]
                                     )(
                                       implicit
                                       webJarsUtil: WebJarsUtil,
                                       assets: AssetsFinder,
                                       system: ActorSystem,
                                       mat: Materializer
                                     ) extends AbstractController(components) with I18nSupport {

  val gameController: ControllerInterface = MineSweeper.controller

  def index: Action[AnyContent] = silhouette.UnsecuredAction.async { implicit request: Request[AnyContent] =>
    Future.successful(Ok(views.html.homeIndex()))
  }

  def about: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    Future.successful(Ok(views.html.homeAbout(gameController, request.identity)))
  }

  def minesweeper: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def newGrid: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.createGrid(10, 10, 10)
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def resizeGrid(height: Int, width: Int, numMines: Int): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.createGrid(height, width, numMines)
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def solve: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.solve()
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def setChecked(row: Int, col: Int): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.setChecked(row, col, false, true, false)
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def setFlag(row: Int, col: Int): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.setFlag(row, col, false, true)
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def unsetFlag(row: Int, col: Int): Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    gameController.setFlag(row, col, true, true)
    Future.successful(Ok(views.html.minesweeper(gameController, request.identity)))
  }

  def gridToJson: Action[AnyContent] = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    Future.successful(Ok(gameController.toJson()))
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
      case event: GridSizeChanged => sendJsonToClient()
      case event: CellChanged => sendJsonToClient()
      case event: Winner => sendJsonToClient()
    }

    def sendJsonToClient(): Unit = {
      println("Received event from Controller")
      out ! gameController.toJson().toString
    }
  }

}
