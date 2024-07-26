<?php

use App\Http\Controllers\CandidatController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentLogController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\EmailLogController;
use App\Http\Controllers\EmailTemplateController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\materielController;
use App\Http\Controllers\PartenaireController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ParticipantFeedbackController;
use App\Http\Controllers\ProxyController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\SentimentAnalysisController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VariableTemplateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmailController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\SessionImageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum', 'verified'])->get('/user', function (Request $request) {
    return $request->user();
});

// User Management Routes
// Role-Based Routes
Route::middleware(['auth:sanctum', 'user-role:SuperAdmin', 'verified'])->group(function () {
    // Routes accessible only to authenticated users with the 'SuperAdmin' role
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user-id/{id}', [UserController::class, 'getUserById']);
    Route::put('/update-user/{id}', [UserController::class, 'update']);
    Route::post('/add-user', [UserController::class, 'store']);
    Route::delete('/delete-user/{id}', [UserController::class, 'destroy']);
    Route::post('/change-is-active/{id}', [UserController::class, 'updateIsActive']);

    //Email route 
    Route::post('/send-email-add-user', [EmailController::class, 'sendEmailAddUser']);
    Route::put('/send-email-edit-user/{id}', [EmailController::class, 'sendEmailEditUser']);
    Route::delete('/send-email-delete-user/{id}', [EmailController::class, 'sendEmailDeteteUser']);
    Route::patch('/send-email-assign-role/{email}', [EmailController::class, 'sendEmailAssignRole']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/edit-profile/{id}', [UserController::class, 'updateProfile'])->middleware(['verified']);
    Route::post('/google-logout', [UserController::class, 'logoutFromGoogle'])->middleware(['verified']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/salles', [SalleController::class, 'index']);
    Route::get('/salle-id/{id}', [salleController::class, 'show']);
    Route::put('/update-salle/{id}', [salleController::class, 'update']);
    Route::post('/add-salle', [salleController::class, 'store']);
    Route::delete('/delete-salle/{id}', [salleController::class, 'destroy']);
    Route::get('/jours-session-salle/{id}', [salleController::class, 'getJourSessionBySalle']);
});

Route::get('/user-email/{email}', [UserController::class, 'getUserByEmail']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/materiaux', [MaterielController::class, 'index']);
    Route::get('/materiel-id/{id}', [MaterielController::class, 'show']);
    Route::put('/update-materiel/{id}', [MaterielController::class, 'update']);
    Route::post('/add-materiel', [MaterielController::class, 'store']);
    Route::delete('/delete-materiel/{id}', [MaterielController::class, 'destroy']);
    Route::get('/duplicate-material/{id}', [MaterielController::class, 'duplicate']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/formateurs', [FormateurController::class, 'index']);
    Route::get('/formateur-id/{id}', [FormateurController::class, 'show']);
    Route::put('/update-formateur/{id}', [FormateurController::class, 'update']);
    Route::post('/add-formateur', [FormateurController::class, 'store']);
    Route::delete('/delete-formateur/{id}', [FormateurController::class, 'destroy']);
    Route::get('/formateurs-speciality/{speciality}', [FormateurController::class, 'filterBySpeciality']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::get('/commande-id/{id}', [CommandeController::class, 'show']);
    Route::put('/update-commande/{id}', [CommandeController::class, 'update']);
    Route::post('/add-commande/{sessionId}', [CommandeController::class, 'store']);
    Route::post('/update-commande-status/{id}', [CommandeController::class, 'updateStatus']);
    Route::get('/notifications', function (Request $request) {
        return auth()->user()->notifications()->where('read', false)->get();
    });
    Route::put('/read-notif/{id}', [CommandeController::class, 'readNotification']);
    // Route::delete('/delete-commande/{id}', [CommandeController::class, 'destroy']);
    Route::get('/products', [CommandeController::class, 'getProducts']);
    Route::get('/suppliers', [CommandeController::class, 'getSuppliers']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/formations', [FormationController::class, 'index']);
    Route::get('/formation-id/{id}', [FormationController::class, 'show']);
    Route::put('/update-formation/{id}', [FormationController::class, 'update']);
    Route::post('/add-formation', [FormationController::class, 'store']);
    Route::delete('/delete-formation/{id}', [FormationController::class, 'destroy']);
    Route::get('/categories', [FormationController::class, 'getAllCategories']);
    Route::get('/sous-category/{category_id}', [FormationController::class, 'sousCategoriesOfSpecificaCategory']);
    Route::get('/formation-ref/{ref}', [FormationController::class, 'getFormationByRef']);
});

// if (Auth::check() && !Auth::user()->provider==="google") {
// Broadcast::routes(['middleware' => ['auth:sanctum']]);
// }

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/candidats', [CandidatController::class, 'index']);
    Route::get('/candidat-id/{id}', [CandidatController::class, 'show']);
    Route::put('/update-candidat/{id}', [CandidatController::class, 'update']);
    Route::post('/add-candidat', [CandidatController::class, 'store']);
    Route::delete('/delete-candidat/{id}', [CandidatController::class, 'destroy']);
    Route::post('/candidats/{candidatId}/formations/{formationId}', [CandidatController::class, 'registerToFormation']);
    Route::put('/update-register-status/{candidatId}/{formationId}', [CandidatController::class, 'updateRegisterStatus']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/document', [DocumentController::class, 'store']);
    Route::post('/upload-template', [DocumentController::class, 'uploadTemplate']);
    Route::get('/documents-templates', [DocumentController::class, 'getAllTemplates']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/partenaires', [PartenaireController::class, 'index']);
    Route::get('/partenaire-id/{id}', [PartenaireController::class, 'show']);
    Route::put('/update-partenaire/{id}', [PartenaireController::class, 'update']);
    Route::post('/add-partenaire', [PartenaireController::class, 'store']);
    Route::delete('/delete-partenaire/{id}', [PartenaireController::class, 'destroy']);
    Route::post('/assign-formation/{id}', [PartenaireController::class, 'assignFormationsToPartenaire']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::get('/session-id/{id}', [SessionController::class, 'show']);
    Route::put('/update-session/{id}', [SessionController::class, 'update']);
    Route::post('/add-session', [SessionController::class, 'store']);
    Route::delete('/delete-session/{id}', [SessionController::class, 'destroy']);
    Route::get('/session-days/{sessionID}', [SessionController::class, 'getDaysOfSession']);
    Route::get('/session/{startDate}/{endDate}/{reference}', [SessionController::class, 'getSessionByCriteria']);
    Route::post('/book-room/{sessionId}', [SessionController::class, 'reserveRoomForSessionDay']);
    Route::get('/check-booked-room/{sessionId}/{dayID}', [SessionController::class, 'isSalleReservedForDay']);
    Route::get('/available-rooms/{sessionId}/{dayID}', [SessionController::class, 'getAvailableRoomsForDay']);
    Route::post('/book-trainer/{sessionId}', [SessionController::class, 'reserveTrainerForSession']);
    Route::get('/trainer-booked-days/{trainerId}', [SessionController::class, 'getJourSessionsForTrainer']);
    Route::get('/available-trainers/{sessionId}/{dayID}', [SessionController::class, 'getAvailableTrinersForDay']);
    Route::post('/book-material/{sessionId}', [SessionController::class, 'reserveMaterialsForSession']);
    Route::get('/sessions/{sessionId}/materials', [SessionController::class, 'getMaterialsForSession']);
    Route::get('/sessions/{sessionId}/commandes', [SessionController::class, 'getCommandesBySessionId']);
});

Route::get('/confirm-session/{id}/{action}', [SessionController::class, 'confirmSession']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/participants', [ParticipantController::class, 'index']);
    Route::post('/add-participant', [ParticipantController::class, 'store']);
    Route::get('/participant-id/{id}', [ParticipantController::class, 'show']);
    Route::put('/update-participant/{id}', [ParticipantController::class, 'update']);
    Route::delete('/delete-participant/{id}', [ParticipantController::class, 'destroy']);
    Route::get('/convert-participant/{candidatId}', [ParticipantController::class, 'convertToParticipant']);
    Route::get('/participate-session/{participantId}/{sessionId}', [ParticipantController::class, 'participateToSession']);
    Route::put('/update-session-status/{participantId}/{sessionId}', [ParticipantController::class, 'updateSessionStatus']);
    Route::get('/participants-in-waiting-list/{sessionId}', [ParticipantController::class, 'getParticipantsInWaitingList']);
    Route::post('/participants/{participantId}/sessions/{sessionId}/cancel', [ParticipantController::class, 'cancelParticipation']);
    Route::put('/update-presence/{participantId}/{jourSessionId}/{sessionId}', [ParticipantController::class, 'updatePresenceStatus']);
    Route::get('/participants/session/{sessionId}', [ParticipantController::class, 'getParticipantsBySessionId']);
    Route::get('/presence/{sessionId}', [ParticipantController::class, 'getPresenceStatusForParticipants']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/emailTemplates', [EmailTemplateController::class, 'index']);
    Route::post('/add-email-template', [EmailTemplateController::class, 'store']);
    Route::get('/emailTemplate-id/{id}', [EmailTemplateController::class, 'show']);
    Route::put('/update-emailTemplate/{id}', [EmailTemplateController::class, 'update']);
    Route::delete('/delete-emailTemplate/{id}', [EmailTemplateController::class, 'destroy']);
    Route::post('/delete-images-attachements/{id}', [EmailTemplateController::class, 'deleteImagesAttachements']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/documentTemplates', [DocumentTemplateController::class, 'index']);
    Route::post('/add-document-template', [DocumentTemplateController::class, 'store']);
    Route::get('/documentTemplate-id/{id}', [DocumentTemplateController::class, 'show']);
    Route::put('/update-documentTemplate/{id}', [DocumentTemplateController::class, 'update']);
    Route::delete('/delete-documentTemplate/{id}', [DocumentTemplateController::class, 'destroy']);
    Route::get('/training-catalog/{type}', [DocumentTemplateController::class, 'generateTrainingCatalog']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/emailLogs', [EmailLogController::class, 'index']);
    // Route::post('/add-document-template', [DocumentTemplateController::class, 'store']);
    // Route::get('/documentTemplate-id/{id}', [DocumentTemplateController::class, 'show']);
    // Route::put('/update-documentTemplate/{id}', [DocumentTemplateController::class, 'update']);
    // Route::delete('/delete-documentTemplate/{id}', [DocumentTemplateController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/documentLogs', [DocumentLogController::class, 'index']);
    // Route::post('/add-document-template', [DocumentTemplateController::class, 'store']);
    // Route::get('/documentTemplate-id/{id}', [DocumentTemplateController::class, 'show']);
    // Route::put('/update-documentTemplate/{id}', [DocumentTemplateController::class, 'update']);
    // Route::delete('/delete-documentTemplate/{id}', [DocumentTemplateController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/proxy', [ProxyController::class, 'handle']);
    Route::post('/get-form-responses', [ProxyController::class, 'getFormResponses']);
    Route::get('/get-all-surveys', [ProxyController::class, 'getAllSurveys']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/sentiment', [SentimentAnalysisController::class, 'getSentiment']);
});
Route::get('/get-recommendations/{participantId}', [SentimentAnalysisController::class, 'getRecommendations']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/variables-template', [VariableTemplateController::class, 'index']);
    Route::post('/add-variable-template', [VariableTemplateController::class, 'store']);
    Route::get('/variable-template-id/{id}', [VariableTemplateController::class, 'show']);
    Route::put('/update-variable-template/{id}', [VariableTemplateController::class, 'update']);
    Route::delete('/delete-variable-template/{id}', [VariableTemplateController::class, 'destroy']);
    Route::get('/source-tables', [VariableTemplateController::class, 'getSourceTables']);
    Route::get('/source-columns/{tableName}', [VariableTemplateController::class, 'getSourceColonnes']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/images-sessions', [SessionImageController::class, 'index']);
    Route::post('/add-image-sessions', [SessionImageController::class, 'store']);
    Route::get('/image-sessions-id/{id}', [SessionImageController::class, 'show']);
    Route::put('/update-image-sessions/{id}', [SessionImageController::class, 'update']);
    Route::delete('/delete-image-sessions/{id}', [SessionImageController::class, 'destroy']);
    Route::post('/linkedin/register-media', [SessionImageController::class, 'registerMedia']);
    Route::post('/linkedin/upload-media', [SessionImageController::class, 'uploadMedia']);
    Route::post('/linkedin/create-share', [SessionImageController::class, 'createShare']);
    Route::post('/linkedin/exchange-code', [SessionImageController::class, 'exchangeCodeForAccessToken']);
    Route::post('/share-image', [SessionImageController::class, 'shareImageOnLinkedIn']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/save-avg-feedback', [ParticipantFeedbackController::class, 'saveAverages']);
    Route::get('/filter-feedbacks', [ParticipantFeedbackController::class, 'filterFeedbacks']);
    Route::get('/formation-averages', [ParticipantFeedbackController::class, 'getFormationAverages']);
    Route::get('/participant-ids', [ParticipantFeedbackController::class, 'getParticipantIds']);
});