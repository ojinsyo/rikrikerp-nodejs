const Project = require("../models/Project/Project");
const RABProjectBagian = require("../models/Project/RABProjectBagian");
const RABJudul = require("../models/Project/RABJudul");
const RABDetail = require("../models/Project/RABDetail");
const Wilayah = require("../models/Wilayah");
const AHSSumberUtama = require("../models/DataSource/AHSSumberUtama");
const AHSProjectUtama = require("../models/AHSProject/AHSProjectUtama");
const AHSProjectDetail = require("../models/AHSProject/AHSProjectDetail");
const HS = require("../models/DataSource/HS");

exports.getProjectFullData = (req, res, next) => {
  console.log("get project full data");
  const TAHUN = req.query.TAHUN;
  console.log(TAHUN);
  Project[TAHUN].findAll({
    include: [
      {
        model: RABProjectBagian[TAHUN],
        request: false,
      },
      {
        model: Wilayah,
        request: false,
      },
    ],
  })
    .then((projects) => {
      return (newProjects = projects.map((satuProject) => {
        const satuProjectTemp = JSON.parse(JSON.stringify(satuProject));
        const RABPB = satuProjectTemp["T_RAB_PROJECT_BAGIAN_" + TAHUN + "s"];
        delete satuProjectTemp["T_RAB_PROJECT_BAGIAN_" + TAHUN + "s"];
        satuProjectTemp["RAB_PROJECT_BAGIAN"] = RABPB;
        return satuProjectTemp;
      }));
    })
    .then((projects) => {
      res.status(201).json({
        message: "Success pull data project",
        projects: projects,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postNewProject = (req, res, next) => {
  const NAMA_PROJECT = req.body.NAMA_PROJECT;
  const ID_WILAYAH = req.body.ID_WILAYAH;
  const TAHUN = req.query.TAHUN;

  Project[TAHUN].create({
    NAMA_PROJECT: NAMA_PROJECT,
    ID_WILAYAH: ID_WILAYAH,
    TAHUN: TAHUN,
  })
    .then((project) => {
      res.status(201).json({
        message: "Success Post New Project to Database",
        project: project,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
      console.log(err);
    });
};

exports.deleteProject = (req, res, next) => {
  const TAHUN = req.body.TAHUN;
  const ID_PROJECT = req.body.ID_PROJECT;
  console.log(TAHUN);
  Project[TAHUN].destroy({
    where: {
      ID_PROJECT: ID_PROJECT,
    },
  })
    .then((project) => {
      console.log("mantap");
      res.status(201).json({
        message: "Success Delete New Project to Database",
        project: project,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
      console.log(err);
    });
};

exports.updateProject = (req, res, next) => {
  console.log("update project");
  const ID_PROJECT = req.body.ID_PROJECT;
  const NAMA_PROJECT = req.body.NAMA_PROJECT;
  const TAHUN = req.body.TAHUN;
  // const ID_WILAYAH = req.body.ID_WILAYAH;

  //console.log(SCREENSHOT_HS);
  console.log(NAMA_PROJECT);

  Project[TAHUN].update(
    {
      NAMA_PROJECT: NAMA_PROJECT,
      //ID_WILAYAH: ID_WILAYAH,
    },
    {
      where: {
        ID_PROJECT: ID_PROJECT,
      },
    }
  )
    .then((project) => {
      console.log("updated project");
      res.status(201).json({
        message: "Success Edit New Project to Database",
        project: project,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
      console.log(err);
    });
};

// ========================================= MARK: RAB Project Bagian =========================================
exports.getRABProjectBagianFullData = async (req, res, next) => {
  const ID_PROJECT = req.query.ID_PROJECT;
  const TAHUN = req.query.TAHUN;

  RABProjectBagian[TAHUN].findAll({
    where: { ID_PROJECT: ID_PROJECT },
    include: [
      {
        model: RABJudul[TAHUN],
        request: false,
        include: [
          {
            model: RABDetail[TAHUN],
            request: false,
          },
        ],
      },
    ],
  })
    .then(async (RABProjectBagian) => {
      var newRABPB = [];
      var rabpbtemp = RABProjectBagian.map(async (rabpb) => {
        //console.log(rabpb);
        var [a, b, c, d] = await counterAndChecker(
          TAHUN,
          rabpb.ID_RAB_PROJECT_BAGIAN
        );

        rabpb.TOTAL_BAHAN_TDP = a;
        rabpb.TOTAL_BAHAN_NON_TDP = b;
        rabpb.TOTAL_UPAH_TDP = c;
        rabpb.TOTAL_UPAH_NON_TDP = d;

        return rabpb;
      });

      for await (const item of rabpbtemp) {
        newRABPB.push(item);
      }
      return newRABPB;
    })
    .then((result) => {
      res.status(201).json({
        message: "Success pull data RAB Project Bagian",
        RABProjectBagian: result,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postNewRABProjectBagian = (req, res, next) => {
  const ID_PROJECT = req.body.ID_PROJECT;
  const JENIS = req.body.JENIS;
  const BAGIAN = req.body.BAGIAN;
  const SUB_BAGIAN = req.body.SUB_BAGIAN;

  const KETERANGAN_JUDUL_REKAP = req.body.KETERANGAN_JUDUL_REKAP;
  const KETERANGAN_BAG_BAWAH_RAB = req.body.KETERANGAN_BAG_BAWAH_RAB;

  // const ID_TTD = req.body.ID_TTD;
  // const TOTAL_UPAH_TDP = req.body.TOTAL_UPAH_TDP;
  // const TOTAL_BAHAN_TDP = req.body.TOTAL_BAHAN_TDP;
  // const TOTAL_UPAH_NON_TDP = req.body.TOTAL_UPAH_NON_TDP;
  // const TOTAL_BAHAN_NON_TDP = req.body.TOTAL_BAHAN_NON_TDP;
  // const JUMLAH_RAB = req.body.JUMLAH_RAB;

  const ID_TTD = req.body.ID_TTD;
  const TOTAL_UPAH_TDP = 0;
  const TOTAL_BAHAN_TDP = 0;
  const TOTAL_UPAH_NON_TDP = 0;
  const TOTAL_BAHAN_NON_TDP = 0;
  const JUMLAH_RAB = 1;

  const TAHUN = req.query.TAHUN;

  RABProjectBagian[TAHUN].create({
    ID_PROJECT: ID_PROJECT,
    JENIS: JENIS,
    BAGIAN: BAGIAN,
    SUB_BAGIAN: SUB_BAGIAN,
    ID_TTD: ID_TTD,
    KETERANGAN_JUDUL_REKAP: KETERANGAN_JUDUL_REKAP,
    JUMLAH_RAB: JUMLAH_RAB,
    TOTAL_UPAH_TDP: TOTAL_UPAH_TDP,
    TOTAL_BAHAN_TDP: TOTAL_BAHAN_TDP,
    TOTAL_UPAH_NON_TDP: TOTAL_UPAH_NON_TDP,
    TOTAL_BAHAN_NON_TDP: TOTAL_BAHAN_NON_TDP,
    KETERANGAN_BAG_BAWAH_RAB: KETERANGAN_BAG_BAWAH_RAB,
  })
    .then((RABProjectBagian) => {
      res.status(201).json({
        message: "Success Post New RAB Project Bagian to Database",
        RABProjectBagian: RABProjectBagian,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
      console.log(err);
    });
};

exports.deleteRABProjectBagian = (req, res, next) => {
  const TAHUN = req.body.TAHUN;
  const ID_RABPB = req.body.ID_RABPB;
  RABProjectBagian[TAHUN].destroy({
    where: { ID_RAB_PROJECT_BAGIAN: ID_RABPB },
  })
    .then((RABPB) => {
      console.log("mantap");
      res.status(201).json({
        message: "Success Delete RABPB to Database",
        RABPB: RABPB,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
      console.log(err);
    });
};

exports.updateRABProjectBagian = (req, res, next) => {
  console.log("update RABProjectBagian");
  console.log(req.body);
  const ID_RAB_PROJECT_BAGIAN = req.body.ID_RAB_PROJECT_BAGIAN;
  const JENIS = req.body.JENIS;
  const BAGIAN = req.body.BAGIAN;
  const SUB_BAGIAN = req.body.SUB_BAGIAN;

  const KETERANGAN_JUDUL_REKAP = req.body.KETERANGAN_JUDUL_REKAP;
  const KETERANGAN_BAG_BAWAH_RAB = req.body.KETERANGAN_BAG_BAWAH_RAB;

  const ID_TTD = req.body.ID_TTD;
  const TOTAL_UPAH_TDP = 0;
  const TOTAL_BAHAN_TDP = 0;
  const TOTAL_UPAH_NON_TDP = 0;
  const TOTAL_BAHAN_NON_TDP = 0;
  const JUMLAH_RAB = 1;

  const TAHUN = req.query.TAHUN;

  console.log({
    JENIS: JENIS,
    BAGIAN: BAGIAN,
    SUB_BAGIAN: SUB_BAGIAN,

    KETERANGAN_JUDUL_REKAP: KETERANGAN_JUDUL_REKAP,
    KETERANGAN_BAG_BAWAH_RAB: KETERANGAN_BAG_BAWAH_RAB,

    ID_TTD: ID_TTD,
    TOTAL_UPAH_TDP: TOTAL_UPAH_TDP,
    TOTAL_BAHAN_TDP: TOTAL_BAHAN_TDP,
    TOTAL_UPAH_NON_TDP: TOTAL_UPAH_NON_TDP,
    TOTAL_BAHAN_NON_TDP: TOTAL_BAHAN_NON_TDP,
    JUMLAH_RAB: JUMLAH_RAB,
  });

  RABProjectBagian[TAHUN].update(
    {
      JENIS: JENIS,
      BAGIAN: BAGIAN,
      SUB_BAGIAN: SUB_BAGIAN,

      // KETERANGAN_JUDUL_REKAP: KETERANGAN_JUDUL_REKAP,
      // KETERANGAN_BAG_BAWAH_RAB: KETERANGAN_BAG_BAWAH_RAB,

      // ID_TTD: ID_TTD,
      // TOTAL_UPAH_TDP: TOTAL_UPAH_TDP,
      // TOTAL_BAHAN_TDP: TOTAL_BAHAN_TDP,
      // TOTAL_UPAH_NON_TDP: TOTAL_UPAH_NON_TDP,
      // TOTAL_BAHAN_NON_TDP: TOTAL_BAHAN_NON_TDP,
      // JUMLAH_RAB: JUMLAH_RAB,
    },
    {
      where: {
        ID_RAB_PROJECT_BAGIAN: ID_RAB_PROJECT_BAGIAN,
      },
    }
  )
    .then((RABPB) => {
      console.log("aman");
      res.status(201).json({
        message: "Success Edit New RABPB to Database",
        RABPB: RABPB,
      });
    })
    .catch((err) => {
      console.log("something went wrong");
      console.log(err);
      //res.status(500).json({ error: err });
    });
};

// counter and checker
async function counterAndChecker(TAHUN, ID_RAB_PROJECT_BAGIAN) {
  // GET RABPB
  var RABPB = await RABProjectBagian[TAHUN].findOne({
    where: {
      ID_RAB_PROJECT_BAGIAN: ID_RAB_PROJECT_BAGIAN,
    },
    include: [
      {
        model: RABJudul[TAHUN],
        request: false,
        include: [
          {
            model: RABDetail[TAHUN],
            request: false,
            include: [
              {
                model: AHSProjectUtama[TAHUN],
                request: false,
                include: [
                  {
                    model: AHSProjectDetail[TAHUN],
                    request: false,
                    include: [
                      {
                        model: HS[TAHUN],
                        request: false,
                      },
                    ],
                  },
                  {
                    model: AHSSumberUtama,
                    request: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  // Get RAB Judul
  var rabjudul = RABPB["T_RAB_JUDUL_" + TAHUN + "s"];

  var newRab = [];
  rabjudul.forEach((satuRab) => {
    const satuRabTemp = JSON.parse(JSON.stringify(satuRab));
    const satuRabDetail = satuRabTemp["T_RAB_DETAIL_" + TAHUN + "s"];
    delete satuRabTemp["T_RAB_DETAIL_" + TAHUN + "s"];
    satuRabTemp["RAB_DETAILS"] = satuRabDetail;
    newRab.push(satuRabTemp);
  });
  rabjudul = newRab;

  totalBahanTdp = 0;
  totalBahanNonTdp = 0;
  totalUpahTdp = 0;
  totalUpahNonTdp = 0;

  rabjudul.forEach((satuRab) => {
    console.log(satuRab);
    categoryBahan = "";
    categoryUpah = "";

    if (
      satuRab.RAB_DETAILS[0] != undefined &&
      satuRab.RAB_DETAILS[0]["AHS_PROJECT_UTAMA_" + TAHUN] != undefined &&
      satuRab.RAB_DETAILS[0]["AHS_PROJECT_UTAMA_" + TAHUN][
        "AHS_PROJECT_DETAIL_" + TAHUN + "s"
      ] != undefined
    ) {
      temptotalupah = 0;
      temptotalbahan = 0;
      // jumlahin apapun
      satuRab.RAB_DETAILS[0]["AHS_PROJECT_UTAMA_" + TAHUN][
        "AHS_PROJECT_DETAIL_" + TAHUN + "s"
      ].forEach((ahsd) => {
        if (ahsd.P_KELOMPOK_URAIAN == "Upah" && ahsd["HS_" + TAHUN] != null) {
          temptotalupah += ahsd["HS_" + TAHUN].HARGA;
        } else if (
          ahsd.P_KELOMPOK_URAIAN == "Bahan" &&
          ahsd["HS_" + TAHUN] != null
        ) {
          temptotalbahan += ahsd["HS_" + TAHUN].HARGA;
        }
      });

      console.log("temp total bahan ", temptotalbahan);
      console.log("temp total upah", temptotalupah);

      // jumlahin bahan
      if (satuRab.RAB_DETAILS[0].BAHAN_NON_TDP) {
        totalBahanNonTdp += temptotalbahan;
      } else {
        totalBahanTdp += temptotalbahan;
      }

      // jumlahin upah
      if (satuRab.RAB_DETAILS[0].UPAH_NON_TDP) {
        totalUpahNonTdp += temptotalupah;
      } else {
        totalUpahTdp += temptotalupah;
      }
    }
  });
  console.log(totalBahanTdp, totalBahanNonTdp, totalUpahTdp, totalUpahNonTdp);
  return [totalBahanTdp, totalBahanNonTdp, totalUpahTdp, totalUpahNonTdp];
}
