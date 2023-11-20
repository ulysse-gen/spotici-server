CREATE DATABASE  IF NOT EXISTS `spotici` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `spotici`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: spotici
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `albums`
--

DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `numId` int NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `artists` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `artistsNames` varchar(255) NOT NULL,
  `release` varchar(255) NOT NULL,
  `total_tracks` int NOT NULL DEFAULT '0',
  `image` varchar(255) NOT NULL DEFAULT 'https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg',
  PRIMARY KEY (`numId`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `albums_chk_1` CHECK (json_valid(`artists`))
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `artists`
--

DROP TABLE IF EXISTS `artists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artists` (
  `numId` int NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`numId`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `playlists`
--

DROP TABLE IF EXISTS `playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlists` (
  `numId` int NOT NULL AUTO_INCREMENT,
  `id` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tracks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` varchar(255) NOT NULL DEFAULT 'user',
  `privacy` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`numId`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `playlists_chk_1` CHECK (json_valid(`tracks`)),
  CONSTRAINT `playlists_chk_2` CHECK (json_valid(`users`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tracks`
--

DROP TABLE IF EXISTS `tracks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracks` (
  `numId` int NOT NULL AUTO_INCREMENT,
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `album` varchar(255) NOT NULL,
  `albumName` varchar(255) NOT NULL,
  `artists` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `artistsNames` varchar(255) NOT NULL,
  `duration_ms` bigint NOT NULL,
  `release` varchar(255) NOT NULL,
  `disc_number` int NOT NULL DEFAULT '1',
  `track_number` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`numId`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `tracks_chk_1` CHECK (json_valid(`artists`))
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `numId` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `permissionLevel` int NOT NULL DEFAULT '10',
  `invalidatedTokens` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creationTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTimestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `accountState` varchar(255) NOT NULL DEFAULT 'emailVerificationPending',
  `profilePicture` varchar(255) NOT NULL,
  PRIMARY KEY (`numId`),
  UNIQUE KEY `username` (`username`),
  CONSTRAINT `users_chk_1` CHECK (json_valid(`invalidatedTokens`))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-20  1:37:05
